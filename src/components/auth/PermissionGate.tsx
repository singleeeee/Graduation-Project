'use client'

import React from 'react'
import { usePermissions } from '@/hooks/use-permissions'

interface PermissionGateProps {
  /** 需要的单个权限 code */
  permission?: string
  /** 需要的多个权限 code（满足任一即可） */
  anyOf?: string[]
  /** 需要的多个权限 code（全部满足才行） */
  allOf?: string[]
  /** 有权限时渲染的内容 */
  children: React.ReactNode
  /** 无权限时渲染的内容，默认不渲染任何东西 */
  fallback?: React.ReactNode
}

/**
 * 权限门控组件
 * 根据用户权限决定是否渲染子内容
 *
 * @example
 * // 单个权限
 * <PermissionGate permission="recruitment_create">
 *   <Button>新建批次</Button>
 * </PermissionGate>
 *
 * // 满足任一权限
 * <PermissionGate anyOf={['recruitment_create', 'recruitment_update']}>
 *   <EditPanel />
 * </PermissionGate>
 *
 * // 无权限时显示提示
 * <PermissionGate permission="user_manage" fallback={<p>无权限</p>}>
 *   <UserManagePanel />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let allowed = false

  if (permission) {
    allowed = hasPermission(permission)
  } else if (anyOf && anyOf.length > 0) {
    allowed = hasAnyPermission(anyOf)
  } else if (allOf && allOf.length > 0) {
    allowed = hasAllPermissions(allOf)
  } else {
    // 没有传任何权限要求，默认放行
    allowed = true
  }

  return allowed ? <>{children}</> : <>{fallback}</>
}
