"use client"

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { rolesApi } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { Role } from '@/lib/api'

interface RoleSelectorProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  excludeRoles?: string[]
  includeRoles?: string[]
}

/**
 * 角色选择器组件
 * 从 API 动态获取角色列表并提供选择功能
 */
export function RoleSelector({
  value,
  onChange,
  placeholder = '选择角色',
  disabled = false,
  className = '',
  required = false,
  excludeRoles = [],
  includeRoles = [],
}: RoleSelectorProps) {
  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
    select: (response) => response || [], // Extract Role[] from response
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // 筛选角色
  const filteredRoles = React.useMemo(() => {
    if (!roles) return []
    
    let filtered = roles
    
    // 排除指定角色
    if (excludeRoles.length > 0) {
      filtered = filtered.filter(
        (role) => !excludeRoles.includes(role.code)
      )
    }
    
    // 只包含指定角色
    if (includeRoles.length > 0) {
      filtered = filtered.filter(
        (role) => includeRoles.includes(role.code)
      )
    }
    
    return filtered
  }, [roles, excludeRoles, includeRoles])

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="加载中..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>加载角色列表失败</AlertDescription>
      </Alert>
    )
  }

  return (
    <Select 
      value={value} 
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredRoles.map((role) => (
          <SelectItem key={role.code} value={role.code}>
            <div className="flex items-center justify-between w-full">
              <span>{role.name}</span>
              {!role.isActive && (
                <span className="text-xs text-muted-foreground ml-2">(已禁用)</span>
              )}
            </div>
          </SelectItem>
        ))}
        {filteredRoles.length === 0 && (
          <SelectItem value="" disabled>
            无可用角色
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

/**
 * 角色选择器（多选版本）
 * 待实现
 */
interface MultiRoleSelectorProps {
  value?: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  excludeRoles?: string[]
  includeRoles?: string[]
}

export function MultiRoleSelector({
  value = [],
  onChange,
  placeholder = '选择角色',
  disabled = false,
  className = '',
  required = false,
  excludeRoles = [],
  includeRoles = [],
}: MultiRoleSelectorProps) {
  // This is a placeholder for multi-select. 
  // In a real application, you might use a library like 'react-select' 
  // or implement a custom multi-select with shadcn/ui Checkbox/DropdownMenu.
  // For now, it behaves like the single selector but accepts/returns an array.
  
  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
    select: (response) => response || [], // Extract Role[] from response
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const filteredRoles = React.useMemo(() => {
    if (!roles) return []
    
    let filtered = roles
    
    if (excludeRoles.length > 0) {
      filtered = filtered.filter(
        (role) => !excludeRoles.includes(role.code)
      )
    }
    
    if (includeRoles.length > 0) {
      filtered = filtered.filter(
        (role) => includeRoles.includes(role.code)
      )
    }
    
    return filtered
  }, [roles, excludeRoles, includeRoles])

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="加载中..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>加载角色列表失败</AlertDescription>
      </Alert>
    )
  }

  // Fallback to single Select for now, but pass the first value
  return (
    <Select 
      value={value[0] || ''} 
      onValueChange={(v) => onChange(v ? [v] : [])}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredRoles.map((role) => (
          <SelectItem key={role.code} value={role.code}>
            <div className="flex items-center justify-between w-full">
              <span>{role.name}</span>
              {!role.isActive && (
                <span className="text-xs text-muted-foreground ml-2">(已禁用)</span>
              )}
            </div>
          </SelectItem>
        ))}
        {filteredRoles.length === 0 && (
          <SelectItem value="" disabled>
            无可用角色
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

// --- Role Badge ---

interface RoleBadgeProps {
  roleCode: string
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
}

export function RoleBadge({ 
  roleCode, 
  size = 'md', 
  showLevel = true 
}: RoleBadgeProps) {
  const { data: roleData } = useQuery({
    queryKey: ['roleByCode', roleCode],
    queryFn: () => rolesApi.getRoleByCode(roleCode),
    enabled: !!roleCode
  })

  const role = roleData?.data
  
  if (!role) {
    return <span className="text-gray-400">未知角色</span>
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} bg-primary text-primary-foreground ${
        role.isActive ? '' : 'opacity-50'
      }`}
    >
      {role.name}
      {showLevel && (
        <span className="ml-1 text-xs opacity-80">
          (L{role.level})
        </span>
      )}
      {!role.isActive && (
        <span className="ml-1 text-xs">(已禁用)</span>
      )}
    </span>
  )
}