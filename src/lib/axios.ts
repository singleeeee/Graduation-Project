import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { globalErrorHandler } from './utils/error-handler'

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 刷新令牌的响应数据
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// 创建 axios 实例配置
const axiosConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

class AxiosService {
  private instance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    this.instance = axios.create(axiosConfig)
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
        
        // 认证相关接口本身（登录、注册、刷新token）发生 401 时，直接返回错误，不触发 token 刷新
        const requestUrl = originalRequest.url || ''
        const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh'].some(
          (path) => requestUrl.includes(path)
        )

        // 如果是 401 错误且不是重试请求且不是认证接口，尝试刷新令牌
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          if (this.isRefreshing) {
            // 如果正在刷新令牌，将请求加入队列
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(() => {
              const token = this.getAccessToken()
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return this.instance(originalRequest)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newTokens = await this.refreshToken()
            this.setAccessToken(newTokens.accessToken)
            this.setRefreshToken(newTokens.refreshToken)

            // 重新设置请求头
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
            }

            // 重试所有失败的请求
            this.processQueue(null, newTokens.accessToken)
            
            return this.instance(originalRequest)
          } catch (refreshError) {
            // 刷新令牌失败，清除所有存储的令牌
            this.clearTokens()
            this.processQueue(refreshError, null)
            
            // 跳转到登录页
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // 通知客户端显示错误提示
        this.notifyClientError(error)
        
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })
    
    this.failedQueue = []
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', token)
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('refresh_token', token)
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  private async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${axiosConfig.baseURL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to refresh token')
    }

    return response.data.data
  }

  private handleError(error: AxiosError): Error & { isApiError?: boolean; statusCode?: number } {
    let err: Error & { isApiError?: boolean; statusCode?: number }
    if (error.response) {
      // 服务器返回了错误响应
      const data = error.response.data as any
      err = new Error(data?.message || `服务器错误: ${error.response.status}`)
      err.statusCode = error.response.status
    } else if (error.request) {
      // 请求发出但没有收到响应
      err = new Error('网络连接失败，请检查网络设置')
    } else {
      // 请求配置出错
      err = new Error(error.message || '请求配置错误')
    }
    // 标记为 API 错误，供全局错误处理器识别并跳过，避免重复处理
    err.isApiError = true
    return err
  }

  private notifyClientError(error: any): void {
    // 只在浏览器环境中发送事件
    if (typeof window !== 'undefined') {
      try {
        const status = error?.response?.status

        // 4xx 错误（401 除外的认证类）属于业务级错误，交由调用方（React Query / mutation）处理
        // 只有 5xx 服务器错误和网络错误才全局广播，避免与页面自身错误处理重复弹窗
        if (status && status >= 400 && status < 500) {
          return
        }

        const errorMessage = globalErrorHandler.extractErrorMessage(error)
        
        // 发送自定义事件到客户端
        const errorEvent = new CustomEvent('api-error', {
          detail: {
            error,
            message: errorMessage,
            timestamp: Date.now()
          }
        })
        
        window.dispatchEvent(errorEvent)
      } catch (e) {
        console.error('Error dispatching client error event:', e)
      }
    }
  }

  // 公共方法
  // 注意：通过 .then(v => v, e => Promise.reject(e)) 确保 rejection 在同一微任务里
  // 就有处理者附着，避免在 await 捕获之前触发 Next.js dev overlay 的 unhandledrejection 监听

  private static wrapRequest<T>(promise: Promise<T>): Promise<T> {
    // 附加一个透传的 rejection handler，使 Promise 在当前微任务就有处理者
    // 这样 Next.js 的 unhandledrejection 监听器不会提前捕获到它
    return promise.then(
      (v) => v,
      (e) => Promise.reject(e)
    )
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return AxiosService.wrapRequest(this.instance.get(url, config))
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return AxiosService.wrapRequest(this.instance.post(url, data, config))
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return AxiosService.wrapRequest(this.instance.put(url, data, config))
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return AxiosService.wrapRequest(this.instance.delete(url, config))
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return AxiosService.wrapRequest(this.instance.patch(url, data, config))
  }

  // Token 管理方法
  public setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken)
    this.setRefreshToken(refreshToken)
  }

  public clearAllTokens(): void {
    this.clearTokens()
  }

  public hasValidToken(): boolean {
    const token = this.getAccessToken()
    return !!token
  }
}

// 创建单例
const axiosService = new AxiosService()

export default axiosService