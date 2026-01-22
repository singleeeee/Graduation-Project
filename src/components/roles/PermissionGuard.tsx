"use client"

import React from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Shield } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  roleLevel?: number
  roleCodes?: string[]
  showError?: boolean
}

/**
 * 权限守卫组件
 * 根据用户权限控制组件的显示和隐藏
 */
export function PermissionGuard({
  children,
  fallback = null,
  permission,
  permissions = [],
  requireAll = false,
  roleLevel,
  roleCodes = [],
  showError = false
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRoleLevel,
    hasAnyRole,
    isLoading
  } = usePermissions()

  // 加载中状态 - 除非明确指定 fallback，否则显示加载提示
  if (isLoading) {
    if (fallback !== null) {
      return fallback
    }
    
    return (
      <div className="flex items-center justify-center min-h-[200px] p-8">
        <div className="text-center">
          <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600 text-sm">正在验证权限...</p>
        </div>
      </div>
    )
  }

  // 检查单个权限
  if (permission && !hasPermission(permission)) {
    return showError ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          您没有访问此功能的权限
        </AlertDescription>
      </Alert>
    ) : fallback
  }

  // 检查多个权限
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    if (!hasRequiredPermissions) {
      return showError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            您没有访问此功能的权限
          </AlertDescription>
        </Alert>
      ) : fallback
    }
  }

  // 检查角色级别
  if (roleLevel !== undefined && !hasRoleLevel(roleLevel)) {
    return showError ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          您的角色级别不足，无法访问此功能
        </AlertDescription>
      </Alert>
    ) : fallback
  }

  // 检查角色代码
  if (roleCodes.length > 0 && !hasAnyRole(roleCodes)) {
    return showError ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          您没有访问此功能的角色权限
        </AlertDescription>
      </Alert>
    ) : fallback
  }

  return <>{children}</>
}

/**
 * 管理员权限守卫组件
 * 简化的管理员权限检查
 */
export function AdminGuard({
  children,
  fallback = null,
  showError = false
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  showError?: boolean
}) {
  return (
    <PermissionGuard
      roleLevel={20}
      fallback={fallback}
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 超级管理员权限守卫组件
 */
export function SuperAdminGuard({
  children,
  fallback = null,
  showError = false
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  showError?: boolean
}) {
  return (
    <PermissionGuard
      roleLevel={50}
      fallback={fallback}
      showError={showError}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * 路由保护组件
 * 用于保护整个页面或路由
 */
export function ProtectedRoute({
  children,
  permission,
  permissions,
  roleLevel,
  roleCodes
}: {
  children: React.ReactNode
  permission?: string
  permissions?: string[]
  roleLevel?: number
  roleCodes?: string[]
}) {
  return (
    <PermissionGuard
      permission={permission}
      permissions={permissions}
      roleLevel={roleLevel}
      roleCodes={roleCodes}
      showError={true}
    >
      {children}
    </PermissionGuard>
  )
}