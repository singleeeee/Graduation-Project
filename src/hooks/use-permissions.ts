import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store'
import { authApi, rolesApi, usersApi } from '@/lib/api'

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
  | 'role_manage'           // 角色管理
  | 'role_view'             // 查看角色
  | 'permission_manage'     // 权限管理
  | 'permission_view'       // 查看权限
  | 'submit_application'    // 提交申请
  | 'view_application_status' // 查看申请状态
  | 'edit_profile'          // 编辑个人资料
  | 'club_manage'          // 社团管理
  | 'file_manage'          // 文件管理

  // 菜单项权限要求
  export const MENU_PERMISSIONS: Record<string, Permission[]> = {
    '/admin/users': ['user_view'],
    '/admin/clubs': ['user_manage'], // 社团管理需要用户管理权限
    '/admin/registration-fields': ['registration_field_manage'],
    '/profile': [], // 个人信息页面，所有已登录用户都可访问
    '/recruitment': ['recruitment_view'],
    '/applications': ['view_application_status'],
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
  role: string | { id: string; name: string; code: string; level: number; permissions?: string[] }
  permissions: Permission[]
}

// 默认角色权限映射 (用于降级处理)
const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [  // 超级管理员拥有所有权限
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
    'role_manage',
    'role_view',
    'permission_manage',
    'permission_view',
    'submit_application',
    'view_application_status',
    'edit_profile',
    'club_manage',
    'file_manage',
  ],
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
    'role_manage',
    'role_view',
    'submit_application',
    'view_application_status',
    'edit_profile',
  ],
  club_admin: [
    'user_view',
    'recruitment_manage',
    'recruitment_view',
    'application_review',
    'interview_manage',
    'statistics_view',
    'edit_profile',
  ],
  interviewer: [
    'recruitment_view',
    'application_review',
    'interview_manage',
    'edit_profile',
  ],
  candidate: [
    'recruitment_view',     // 查看招新信息
    'submit_application',    // 提交申请
    'view_application_status', // 查看申请状态  
    'edit_profile'          // 编辑个人资料
  ]
}

/**
 * 获取角色的基础权限 (降级处理)
 */
function getDefaultPermissionsForRole(roleCode: string): Permission[] {
  return DEFAULT_ROLE_PERMISSIONS[roleCode] || ['edit_profile'] // 默认至少可以编辑个人资料
}

interface UsePermissionsReturn {
  user: User | null
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  isLoading: boolean
  error: Error | null
  checkMenuAccess: (path: string) => boolean
  refreshPermissions: () => void
}

export function usePermissions(): UsePermissionsReturn {
  const { user: authUser, isAuthenticated } = useAppStore()
  const [user, setUser] = useState<User | null>(null)

  // 获取用户权限的React Query Hook
  const { data: userPermissions, isLoading, error, refetch } = useQuery({
    queryKey: ['userPermissions', authUser.id],
    queryFn: async () => {
      if (!authUser.id) return []
      
      // 如果用户信息中包含了权限，直接使用
      if (authUser.permissions && Array.isArray(authUser.permissions)) {
        return authUser.permissions
      }
      
      // 如果角色是对象且包含权限信息
      if (authUser.role && typeof authUser.role === 'object' && authUser.role.permissions) {
        return authUser.role.permissions
      }
      
       // 尝试从用户API获取详细信息以提取角色权限
      try {
        const response = await usersApi.getUserById(authUser.id!)
        // 检查响应中的角色信息 - UserProfile.role 可能是对象或字符串
        const roleData = response.role
        if (roleData && typeof roleData === 'object' && 'permissions' in roleData) {
          return roleData.permissions || []
        }
        
        // 如果角色是对象但有code，尝试获取默认权限
        if (roleData && typeof roleData === 'object' && roleData.code) {
          return getDefaultPermissionsForRole(roleData.code)
        }
        
        // 如果角色是字符串，直接获取默认权限
        if (typeof roleData === 'string') {
          return getDefaultPermissionsForRole(roleData)
        }
        
        return []
      } catch (error) {
        console.error('获取用户权限失败:', error)
        // 降级处理：基于角色级别分配基础权限
        let roleCode = 'candidate'
        if (typeof authUser.role === 'string') {
          roleCode = authUser.role
        } else if (authUser.role && typeof authUser.role === 'object' && authUser.role.code) {
          roleCode = authUser.role.code
        }
        return getDefaultPermissionsForRole(roleCode)
      }
    },
    enabled: !!authUser.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 从认证系统获取当前用户信息
  useEffect(() => {
    const checkAuth = () => {
      return !!(authUser.id && authUser.email)
    }
    
    if (checkAuth()) {
      // 处理角色信息：转换为字符串表示用于权限检查
      let roleCode: string
      if (authUser.role && typeof authUser.role === 'object' && authUser.role.code) {
        roleCode = authUser.role.code
      } else if (authUser.role && typeof authUser.role === 'string') {
        roleCode = authUser.role
      } else {
        roleCode = 'candidate'
      }

      const userWithPermissions: User = {
        id: authUser.id!,
        name: authUser.name || '',
        email: authUser.email!,
        role: authUser.role || roleCode, // 保持原始角色对象/字符串
        permissions: userPermissions as Permission[] || []
      }
      setUser(userWithPermissions)
    } else {
      setUser(null)
    }
  }, [authUser, userPermissions, isAuthenticated])

  // 检查单个权限
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    
    // 获取角色代码进行超级管理员检查
    let roleCode: string
    if (typeof user.role === 'string') {
      roleCode = user.role
    } else if (user.role && typeof user.role === 'object' && user.role.code) {
      roleCode = user.role.code
    } else {
      roleCode = 'candidate'
    }
    
    // 超级管理员和系统管理员拥有所有权限
    if (roleCode === 'super_admin' || roleCode === 'system_admin') return true
    
    // 检查用户具体权限
    const userPerms = user.permissions || []
    return userPerms.includes(permission)
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
    isLoading,
    error,
    checkMenuAccess,
    refreshPermissions: refetch,
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
  const filteredMenuItems = allMenuItems.filter(item => {
    if (item.permission) {
      return checkMenuAccess(item.href)
    }
    return true
  })

  return filteredMenuItems
}