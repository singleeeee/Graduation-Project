// 登录请求数据
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求数据
export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
  studentId?: string
  major?: string
  grade?: string
  experience?: string
  motivation?: string
}

// 登录响应数据
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn?: number
  user: {
    id: string
    name: string
    email: string
    role: {
      id: string
      name: string
      code: string
      level: number
      permissions: string[]
    }
    permissions: string[]
    major?: string
    grade?: string
  }
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  refreshToken: string
}

// 用户资料响应 - 为了验证令牌使用的基础版本
export interface UserProfileBasic {
  id: string
  name: string
  email: string
  phone?: string
  studentId?: string
  major?: string
  grade?: string
  role: {
    id: string
    name: string
    code: string
    level: number
    permissions?: string[]
  }
  permissions: string[]
  avatar?: string
  createdAt: string
  updatedAt: string
}