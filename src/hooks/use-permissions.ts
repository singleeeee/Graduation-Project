import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store'
import { rolesApi, permissionsApi } from '@/lib/api'
import type { Permission, Role } from '@/lib/api'

/**
 * 权限检查 Hook
 * 提供用户权限验证和角色管理功能
 * 
 * @returns 权限检查相关的状态和方法
 */
export function usePermissions() {
  const { user } = useAppStore()

  // 获取当前用户角色详情
  const { data: userRoleData, isLoading: isRoleLoading } = useQuery({
    queryKey: ['userRole', user?.roleCode],
    queryFn: () => rolesApi.getRoleByCode(user!.roleCode!),
    enabled: !!user?.roleCode,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
  })

  // 获取当前用户权限列表
  const { data: userPermissionsData, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ['userPermissions', userRoleData?.id],
    queryFn: () => rolesApi.getRolePermissions(userRoleData!.id),
    enabled: !!userRoleData?.id,
    select: (response) => (response as any)?.codes || [],
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
  })

  // 检查用户是否具有指定权限
  const hasPermission = (permissionCode: string): boolean => {
    // 超级管理员和系统管理员拥有所有权限
    if (user?.roleCode === 'super_admin' || user?.roleCode === 'system_admin') {
      return true
    }
    
    if (!userPermissionsData) return false
    return userPermissionsData.includes(permissionCode)
  }

  // 检查用户是否具有任一权限
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    // 超级管理员和系统管理员拥有所有权限
    if (user?.roleCode === 'super_admin' || user?.roleCode === 'system_admin') {
      return true
    }
    
    if (!userPermissionsData) return false
    return permissionCodes.some(code => userPermissionsData.includes(code))
  }

  // 检查用户是否具有所有权限
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    // 超级管理员和系统管理员拥有所有权限
    if (user?.roleCode === 'super_admin' || user?.roleCode === 'system_admin') {
      return true
    }
    
    if (!userPermissionsData) return false
    return permissionCodes.every(code => userPermissionsData.includes(code))
  }

  // 检查用户角色级别是否足够
  const hasRoleLevel = (requiredLevel: number): boolean => {
    if (!userRoleData) return false
    return userRoleData.level >= requiredLevel
  }

  // 检查用户是否具有指定角色
  const hasRole = (roleCode: string): boolean => {
    return user?.roleCode === roleCode
  }

  // 检查用户是否具有任一角色
  const hasAnyRole = (roleCodes: string[]): boolean => {
    return roleCodes.includes(user?.roleCode || '')
  }

  return {
    // 用户角色信息
    userRole: userRoleData,
    userPermissions: userPermissionsData,
    
    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // 角色检查方法
    hasRoleLevel,
    hasRole,
    hasAnyRole,
    
    // 加载状态 - 更智能的判断逻辑
    isLoading: (isRoleLoading || isPermissionsLoading) && (!userRoleData || !userPermissionsData)
  }
}

/**
 * 角色管理 Hook
 * 提供角色相关的数据获取和管理功能
 */
export function useRoles(filters?: {
  page?: number
  limit?: number
  search?: string
  level?: number
  isActive?: boolean
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roles', filters],
    queryFn: () => rolesApi.getRoles(filters),
    select: (response) => {
      const data = response?.data?.data || response?.data
      return {
        roles: data?.roles || [],
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: data?.totalPages || 0
      }
    }
  })

  return {
    roles: data?.roles || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  }
}

/**
 * 权限管理 Hook
 * 提供权限相关的数据获取和管理功能
 */
export function usePermissionsList(filters?: {
  page?: number
  limit?: number
  module?: string
  search?: string
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['permissions', filters],
    queryFn: () => permissionsApi.getPermissions(filters),
    select: (response) => {
      const data = response?.data?.data || response?.data
      return {
        permissions: data?.permissions || [],
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: data?.totalPages || 0
      }
    }
  })

  return {
    permissions: data?.permissions || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch
  }
}

/**
 * 权限模块 Hook
 * 获取所有权限模块列表
 */
export function usePermissionModules() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['permissionModules'],
    queryFn: () => permissionsApi.getPermissionModules(),
    select: (response) => response?.data?.data || response?.data || []
  })

  return {
    modules: data || [],
    isLoading,
    error
  }
}

/**
 * 角色详情 Hook
 * 获取指定角色的详细信息
 */
export function useRoleDetail(roleId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roleDetail', roleId],
    queryFn: () => rolesApi.getRole(roleId),
    enabled: !!roleId,
    select: (response) => response?.data?.data || response?.data
  })

  return {
    role: data,
    isLoading,
    error,
    refetch
  }
}

/**
 * 权限详情 Hook
 * 获取指定权限的详细信息
 */
export function usePermissionDetail(permissionId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['permissionDetail', permissionId],
    queryFn: () => permissionsApi.getPermission(permissionId),
    enabled: !!permissionId,
    select: (response) => response?.data?.data || response?.data
  })

  return {
    permission: data,
    isLoading,
    error,
    refetch
  }
}

/**
 * 菜单项类型定义
 */
interface MenuItem {
  title: string
  icon: string
  href: string
  current: boolean
  permission?: string
  permissions?: string[]
}

/**
 * 菜单项 Hook
 * 根据用户权限动态生成菜单项
 */
export function useMenuItems(currentPath: string = '/'): MenuItem[] {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  const allMenuItems: MenuItem[] = [
    {
      title: '仪表盘',
      icon: '📊',
      href: '/',
      current: currentPath === '/',
    },
    {
      title: '用户管理',
      icon: '👤',
      href: '/admin/users',
      current: currentPath.startsWith('/admin/users'),
      permission: 'user_view',
    },
    {
      title: '角色权限管理',
      icon: '🛡️',
      href: '/admin/roles',
      current: currentPath.startsWith('/admin/roles'),
      permission: 'role_manage',
    },
    {
      title: '社团管理',
      icon: '🏢',
      href: '/admin/clubs',
      current: currentPath.startsWith('/admin/clubs'),
      permission: 'user_manage',
    },
    {
      title: '字段配置',
      icon: '⚙️',
      href: '/admin/registration-fields',
      current: currentPath.startsWith('/admin/registration-fields'),
      permission: 'registration_field_manage',
    },
    {
      title: '个人信息',
      icon: '👤',
      href: '/profile',
      current: currentPath === '/profile',
      // 所有已登录用户都可以访问个人信息页面
    },
    {
      title: '招新信息',
      icon: '👥',
      href: '/recruitment',
      current: currentPath.startsWith('/recruitment'),
      permission: 'recruitment_view',
    },
    {
      title: '我的申请',
      icon: '📝',
      href: '/applications',
      current: currentPath.startsWith('/applications'),
      permission: 'view_application_status',
    },
    {
      title: '简历筛选',
      icon: '📋',
      href: '/screening',
      current: currentPath.startsWith('/screening'),
      permission: 'application_review',
    },
    {
      title: '面试安排',
      icon: '📅',
      href: '/interview',
      current: currentPath.startsWith('/interview'),
      permission: 'interview_manage',
    },
    {
      title: '数据统计',
      icon: '📈',
      href: '/statistics',
      current: currentPath.startsWith('/statistics'),
      permission: 'statistics_view',
    },
    {
      title: '系统设置',
      icon: '🔧',
      href: '/settings',
      current: currentPath.startsWith('/settings'),
      permission: 'system_settings',
    },
  ]

  // 根据权限过滤菜单项
  return allMenuItems.filter(item => {
    if (!item.permission && !item.permissions) {
      return true // 没有权限要求的菜单项总是显示
    }
    
    if (item.permission) {
      return hasPermission(item.permission)
    }
    
    if (item.permissions) {
      // 可以根据需求配置为任一权限或全部权限
      return hasAnyPermission(item.permissions)
    }
    
    return false
  })
}