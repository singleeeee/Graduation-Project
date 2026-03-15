import { authApi, usersApi } from './api'
import { useAppStore } from '@/store'

/**
 * 登录并更新用户状态
 */
export async function loginAndSetUser(email: string, password: string) {
  try {
    console.log('loginAndSetUser: 开始登录流程', { email })
    
    const loginResponse = await authApi.login({ email, password })
    console.log('loginAndSetUser: API登录成功', { loginResponse })
    
    // 从登录响应中获取用户资料
    if (!loginResponse || !loginResponse.user) {
      throw new Error('登录响应格式不正确，缺少用户信息')
    }
    
    const userProfile = loginResponse.user
    console.log('loginAndSetUser: 获取用户资料成功', { userProfile })
    
    // 确保角色信息被正确处理
    let roleValue: any = null
    if (userProfile.role) {
      if (typeof userProfile.role === 'object' && userProfile.role.code) {
        roleValue = userProfile.role // 保存完整的角色对象
      } else if (typeof userProfile.role === 'string') {
        roleValue = userProfile.role
      }
    }
    
    // 更新 Zustand store - 确保权限数据也被正确设置
    const { setUser } = useAppStore.getState()
    let userPermissions: string[] = []
    
    // 从角色对象中提取权限
    if (roleValue && typeof roleValue === 'object' && roleValue.permissions) {
      userPermissions = roleValue.permissions
    }
    
    setUser({
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: roleValue,
      permissions: userPermissions
    })
    
    console.log('loginAndSetUser: 用户状态更新完成')
    return loginResponse
  } catch (error) {
    console.error('loginAndSetUser: 登录失败:', error)
    throw error
  }
}

/**
 * 用户登出
 */
export async function logout() {
  try {
    await authApi.logout()
  } catch (error) {
    console.error('登出API调用失败，仍然清除本地状态:', error)
    // 即使 API 调用失败，也要确保清除本地 token
    authApi.clearAuth()
  } finally {
    // 无论成功或失败，始终清除 Zustand store 中的用户数据
    const { logout: logoutStore } = useAppStore.getState()
    logoutStore()
  }
  return true
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
      console.log('refreshAuthToken: 未找到刷新令牌')
      return false
    }
    
    console.log('refreshAuthToken: 开始刷新令牌')
    await authApi.refreshToken(refreshToken)
    console.log('refreshAuthToken: 令牌刷新成功')
    return true
  } catch (error) {
    console.error('refreshAuthToken: 刷新令牌失败:', error)
    return false
  }
}

/**
 * 初始化用户会话（用于应用启动时）
 */
export async function initializeAuth(): Promise<boolean> {
  try {
    // 优先检查 Zustand 中是否已有用户信息，如果有则无需重复获取
    const { user } = useAppStore.getState();
    if (user.id && user.email) {
      console.log('initializeAuth: Zustand 中已有用户信息，跳过 profile 请求')
      return true;
    }

    // 检查是否有存储的token
    const hasValidToken = authApi.isAuthenticated()
    if (!hasValidToken) {
      console.log('initializeAuth: 未发现有效token')
      return false // 未认证
    }

    console.log('initializeAuth: 发现token，尝试验证用户身份')
    
    // 验证当前令牌并获取用户资料
    const userProfile = await usersApi.getProfile()
    
    console.log('initializeAuth: 成功获取用户资料', userProfile)
    
    // 更新用户状态
    const { setUser } = useAppStore.getState()
    
    // 提取角色信息和权限
    let roleValue: any = null
    let userPermissions: string[] = []
    
    if (userProfile.role) {
      if (typeof userProfile.role === 'object' && userProfile.role.code) {
        roleValue = userProfile.role
        userPermissions = userProfile.role.permissions || []
      } else if (typeof userProfile.role === 'string') {
        roleValue = userProfile.role
      }
    }
    
    setUser({
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: roleValue,
      permissions: userPermissions
    })
    
    console.log('initializeAuth: 用户状态更新完成')
    return true
  } catch (error) {
    console.error('initializeAuth: 获取用户信息失败:', error)
    
    // 如果验证失败，检查是否是401错误，尝试刷新令牌
    if (error instanceof Error && error.message.includes('401')) {
      console.log('initializeAuth: token无效，尝试刷新')
      const refreshed = await refreshAuthToken()
      if (refreshed) {
        console.log('initializeAuth: token刷新成功，重试获取用户信息')
        try {
          const userProfile = await usersApi.getProfile()
          const { setUser } = useAppStore.getState()
          
          // 提取角色信息和权限
          let roleValue: any = null
          let userPermissions: string[] = []
          
          if (userProfile.role) {
            if (typeof userProfile.role === 'object' && userProfile.role.code) {
              roleValue = userProfile.role
              userPermissions = userProfile.role.permissions || []
            } else if (typeof userProfile.role === 'string') {
              roleValue = userProfile.role
            }
          }
          
          setUser({
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            role: roleValue,
            permissions: userPermissions
          })
          return true
        } catch (retryError) {
          console.error('initializeAuth: 重试获取用户信息失败:', retryError)
          // 如果重试也失败，清除认证信息
          const { logout: logoutStore } = useAppStore.getState()
          logoutStore()
          return false
        }
      }
    }
    
    // 如果验证失败或刷新失败，清除认证信息
    console.log('initializeAuth: 认证失败，清除用户状态')
    const { logout: logoutStore } = useAppStore.getState()
    logoutStore()
    
    // 清除token
    authApi.clearAuth()
    return false
  }
}