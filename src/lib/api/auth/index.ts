import axiosService, { type ApiResponse } from '../../axios'
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RefreshTokenRequest,
  UserProfileBasic
} from './types'

// 导出类型以供其他模块使用
export type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RefreshTokenRequest,
  UserProfileBasic
} from './types'

// 认证 API 类
class AuthApi {
  private axios = axiosService

  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.axios.post<any>('/auth/login', data)
    
    // 自动保存令牌到本地存储
    if (response && response.data && response.data.accessToken && response.data.refreshToken) {
      this.axios.setTokens(response.data.accessToken, response.data.refreshToken)
    }
    
    return response.data
  }

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await this.axios.post<any>('/auth/register', data)
    
    // 自动保存令牌到本地存储
    if (response && response.data && response.data.accessToken && response.data.refreshToken) {
      this.axios.setTokens(response.data.accessToken, response.data.refreshToken)
    }
    
    return response.data
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await this.axios.post<any>('/auth/refresh', {
      refreshToken
    })
    
    // 自动保存新的令牌 - 处理直接响应格式
    const tokenData = response.data || response
    if (tokenData && tokenData.accessToken && tokenData.refreshToken) {
      this.axios.setTokens(tokenData.accessToken, tokenData.refreshToken)
    }
    
    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn || 900
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<{ message: string }> {
    const response = await this.axios.post<any>('/auth/logout')
    
    // 清除本地存储的令牌
    this.axios.clearAllTokens()
    
    // 处理直接响应格式
    const logoutData = response.data || response
    return {
      message: logoutData.message || 'Logged out successfully'
    }
  }

  /**
   * 检查服务器健康状态
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.axios.get<any>('/health')
    // 处理直接响应格式
    const healthData = response.data || response
    return {
      status: healthData.status || 'unknown',
      timestamp: healthData.timestamp || new Date().toISOString()
    }
  }

  /**
   * 验证当前令牌是否有效
   */
  async validateToken(): Promise<{ valid: boolean; user: UserProfileBasic }> {
    const response = await this.axios.get<any>('/auth/validate')
    // 处理直接响应格式
    const tokenData = response.data || response
    return {
      valid: tokenData.valid || false,
      user: tokenData.user || null
    }
  }

  /**
   * 获取当前认证状态
   */
  isAuthenticated(): boolean {
    return this.axios.hasValidToken()
  }

  /**
   * 手动清除认证信息
   */
  clearAuth(): void {
    this.axios.clearAllTokens()
  }

  /**
   * 手动设置token（用于注册后自动登录）
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.axios.setTokens(accessToken, refreshToken)
  }
}

// 创建单例
const authApi = new AuthApi()

export default authApi