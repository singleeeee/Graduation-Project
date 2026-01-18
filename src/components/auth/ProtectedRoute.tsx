import { ReactNode } from 'react'
import { usePermissions, Permission } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
}

/**
 * 权限保护路由组件
 * 
 * @example
 * // 单个权限保护
 * <ProtectedRoute permission="user_manage">
 *   <UserManagementPage />
 * </ProtectedRoute>
 * 
 * // 多个权限保护，满足任意一个即可
 * <ProtectedRoute permissions={['user_view', 'user_manage']}>
 *   <UserPage />
 * </ProtectedRoute>
 * 
 * // 多个权限保护，需要满足所有权限
 * <ProtectedRoute permissions={['user_view', 'user_edit']} requireAll>
 *   <UserEditPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions()

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 检查权限
  let hasAccess = true
  
  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  }

  // 如果有访问权限，返回子组件
  if (hasAccess) {
    return <>{children}</>
  }

  // 如果没有访问权限，返回fallback或默认的无权限页面
  if (fallback) {
    return <>{fallback}</>
  }

  // 默认无权限页面
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">访问被拒绝</h2>
        <p className="text-gray-600 mb-6">
          您没有访问此页面的权限。请联系管理员获取相应权限。
        </p>
        <Button 
          onClick={() => window.history.back()}
          variant="outline"
        >
          返回上一页
        </Button>
      </div>
    </div>
  )
}

/**
 * 隐藏式权限保护组件（不显示任何内容而不是显示无权限页面）
 */
export function ProtectedView({
  children,
  permission,
  permissions,
  requireAll = false
}: Omit<ProtectedRouteProps, 'fallback'>) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions()

  // 加载中状态，不显示任何内容
  if (isLoading) {
    return null
  }

  // 检查权限
  let hasAccess = true
  
  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  }

  // 只有有权限时才渲染子组件
  return hasAccess ? <>{children}</> : null
}