"use client"

import React from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
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
  roleCodes = [],
  showError = false
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    isLoading
  } = usePermissions()

  // 加载中状态
  if (isLoading) {
    return fallback !== null ? fallback : null
  }

  // 检查单个权限
  if (permission && !hasPermission(permission)) {
    return showError ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>您没有访问此功能的权限</AlertDescription>
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
          <AlertDescription>您没有访问此功能的权限</AlertDescription>
        </Alert>
      ) : fallback
    }
  }

  // 检查角色代码
  if (roleCodes.length > 0 && !hasAnyRole(roleCodes)) {
    return showError ? (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>您没有访问此功能的角色权限</AlertDescription>
      </Alert>
    ) : fallback
  }

  return <>{children}</>
}

/**
 * 路由保护组件
 * 用于保护整个页面或路由
 */
export function ProtectedRoute({
  children,
  permission,
  permissions,
  roleCodes
}: {
  children: React.ReactNode
  permission?: string
  permissions?: string[]
  roleCodes?: string[]
}) {
  return (
    <PermissionGuard
      permission={permission}
      permissions={permissions}
      roleCodes={roleCodes}
      showError={true}
    >
      {children}
    </PermissionGuard>
  )
}
