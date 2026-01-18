import { authApi, usersApi } from './api'
import { useAppStore } from '@/store'

/**
 * 登录并更新用户状态
 */
export async function loginAndSetUser(email: string, password: string) {
  try {
    const loginResponse = await authApi.login({ email, password })
    
    // 获取用户完整资料
    const userProfile = await usersApi.getProfile()
    
    // 更新 Zustand store
    const { setUser } = useAppStore.getState()
    setUser({
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: typeof userProfile.role === 'object' ? userProfile.role?.code || userProfile.role?.name : userProfile.role
    })
    
    return userProfile
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

/**
 * 用户登出
 */
export async function logout() {
  try {
    await authApi.logout()
    
    // 清除 Zustand store 中的用户数据
    const { logout: logoutStore } = useAppStore.getState()
    logoutStore()
    
    return true
  } catch (error) {
    console.error('登出失败:', error)
    // 即使 API 调用失败，也要清除本地状态
    const { logout: logoutStore } = useAppStore.getState()
    logoutStore()
    throw error
  }
}

/**
 * 检查用户是否已认证
 */
export function isAuthenticated(): boolean {
  return authApi.isAuthenticated()
}

/**
 * 刷新令牌（如果存在）
 */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      return false
    }
    
    await authApi.refreshToken(refreshToken)
    return true
  } catch (error) {
    console.error('刷新令牌失败:', error)
    return false
  }
}

/**
 * 初始化用户会话（用于应用启动时）
 */
export async function initializeAuth(): Promise<boolean> {
  if (!isAuthenticated()) {
    return false
  }

  try {
    // 验证当前令牌并获取用户资料
    const userProfile = await usersApi.getProfile()
    
    // 更新用户状态
    const { setUser } = useAppStore.getState()
    setUser({
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: typeof userProfile.role === 'object' ? userProfile.role?.code || userProfile.role?.name : userProfile.role
    })
    
    return true
  } catch (error) {
    console.error('初始化认证失败:', error)
    
    // 如果验证失败，尝试刷新令牌
    const refreshed = await refreshAuthToken()
    if (refreshed) {
      return await initializeAuth() // 递归调用
    }
    
    // 如果刷新也失败，清除认证信息
    logout()
    return false
  }
}