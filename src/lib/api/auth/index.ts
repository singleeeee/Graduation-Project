import axiosService from '../../axios'
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
    const response = await this.axios.post<{ accessToken: string; refreshToken: string; expiresIn: number }>('/auth/refresh', {
      refreshToken
    })
    
    // 自动保存新的令牌
    if (response.data && response.data.accessToken && response.data.refreshToken) {
      this.axios.setTokens(response.data.accessToken, response.data.refreshToken)
    }
    
    return response.data
  }

  /**
   * 用户登出
   */
  async logout(): Promise<{ message: string }> {
    const response = await this.axios.post<{ message: string }>('/auth/logout')
    
    // 清除本地存储的令牌
    this.axios.clearAllTokens()
    
    return response.data
  }

  /**
   * 检查服务器健康状态
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.axios.get<{ status: string; timestamp: string }>('/health')
    return response.data
  }

  /**
   * 验证当前令牌是否有效
   */
  async validateToken(): Promise<{ valid: boolean; user: UserProfileBasic }> {
    const response = await this.axios.get<{ valid: boolean; user: UserProfileBasic }>('/auth/validate')
    return response.data
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