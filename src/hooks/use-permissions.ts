import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 权限类型定义
export type Permission = 
  | 'user_manage'           // 用户管理
  | 'user_view'             // 查看用户
  | 'user_create'           // 创建用户
  | 'user_edit'             // 编辑用户
  | 'user_delete'           // 删除用户
  | 'user_export'           // 导出用户
  | 'registration_field_manage' // 注册字段管理
  | 'system_settings'       // 系统设置
  | 'recruitment_manage'    // 招新管理
  | 'recruitment_view'      // 查看招新
  | 'application_review'    // 申请审核
  | 'interview_manage'      // 面试管理
  | 'statistics_view'       // 查看统计

// 角色权限映射
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  system_admin: [
    'user_manage',
    'user_view',
    'user_create',
    'user_edit',
    'user_delete',
    'user_export',
    'registration_field_manage',
    'system_settings',
    'recruitment_manage',
    'recruitment_view',
    'application_review',
    'interview_manage',
    'statistics_view',
  ],
  club_admin: [
    'user_view',
    'recruitment_manage',
    'recruitment_view',
    'application_review',
    'interview_manage',
    'statistics_view',
  ],
  candidate: []
}

// 菜单项权限要求
export const MENU_PERMISSIONS: Record<string, Permission[]> = {
  '/admin/users': ['user_view'],
  '/admin/registration-fields': ['registration_field_manage'],
  '/recruitment': ['recruitment_view'],
  '/screening': ['application_review'],
  '/interview': ['interview_manage'],
  '/statistics': ['statistics_view'],
  '/settings': ['system_settings'],
}

// 用户信息接口
interface User {
  id: string
  name: string
  email: string
  role: string
  permissions?: Permission[]
}

interface UsePermissionsReturn {
  user: User | null
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  isLoading: boolean
  error: Error | null
  checkMenuAccess: (path: string) => boolean
}

export function usePermissions(): UsePermissionsReturn {
  const [user, setUser] = useState<User | null>(null)

  // 模拟获取当前用户信息，实际应该从认证系统获取
  useEffect(() => {
    // 这里应该调用认证API获取用户信息
    const mockUser: User = {
      id: 'user-1',
      name: '超级管理员',
      email: 'admin@example.com',
      role: 'system_admin',
      permissions: ROLE_PERMISSIONS.system_admin
    }
    setUser(mockUser)
  }, [])

  // 检查单个权限
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    
    // 超级管理员拥有所有权限
    if (user.role === 'system_admin') return true
    
    // 检查用户具体权限
    const userPermissions = user.permissions || ROLE_PERMISSIONS[user.role] || []
    return userPermissions.includes(permission)
  }

  // 检查是否有任意一个权限
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  // 检查是否拥有所有权限
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  // 检查菜单访问权限
  const checkMenuAccess = (path: string): boolean => {
    const requiredPermissions = MENU_PERMISSIONS[path]
    if (!requiredPermissions) return true // 如果没有定义权限要求，默认允许访问
    
    return hasAnyPermission(requiredPermissions)
  }

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: !user,
    error: null,
    checkMenuAccess,
  }
}

// 菜单项接口
export interface MenuItem {
  title: string
  icon: string
  href: string
  current: boolean
  permission?: Permission
  children?: MenuItem[]
}

// 获取基于权限的菜单
export function useMenuItems(currentPath: string = '/'): MenuItem[] {
  const { checkMenuAccess } = usePermissions()

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
      title: '字段配置',
      icon: '⚙️',
      href: '/admin/registration-fields',
      current: currentPath.startsWith('/admin/registration-fields'),
      permission: 'registration_field_manage',
    },
    {
      title: '招新管理',
      icon: '👥',
      href: '/recruitment',
      current: currentPath.startsWith('/recruitment'),
      permission: 'recruitment_view',
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
  const filteredMenuItems = allMenuItems.filter(item => {
    if (item.permission) {
      return checkMenuAccess(item.href)
    }
    return true
  })

  return filteredMenuItems
}