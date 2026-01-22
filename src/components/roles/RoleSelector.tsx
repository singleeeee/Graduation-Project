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
  placeholder = "选择角色",
  disabled = false,
  className = "",
  required = false,
  excludeRoles = [],
  includeRoles = []
}: RoleSelectorProps) {
  const { data: rolesData, isLoading, error } = useQuery({
    queryKey: ['roles', { limit: 100, isActive: true }],
    queryFn: async () => {
      const response: any = await rolesApi.getRoles({ limit: 100, isActive: true })
      let roles = response?.data?.roles || response?.roles || []
      
      if (excludeRoles.length > 0) {
        roles = roles.filter((role: Role) => !excludeRoles.includes(role.code))
      }
      
      if (includeRoles.length > 0) {
        roles = roles.filter((role: Role) => includeRoles.includes(role.code))
      }
      
      return roles
    }
  })

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          加载角色列表失败
        </AlertDescription>
      </Alert>
    )
  }

  const roles = rolesData || []

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
        {roles.length === 0 ? (
          <SelectItem value="" disabled>
            暂无可用角色
          </SelectItem>
        ) : (
          roles.map((role: Role) => (
            <SelectItem key={role.id} value={role.code}>
              {role.name} ({role.code}) - 级别 {role.level}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

/**
 * 多角色选择器组件
 * 允许选择多个角色
 */
interface MultiRoleSelectorProps {
  value?: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  excludeRoles?: string[]
  includeRoles?: string[]
}

export function MultiRoleSelector({
  value = [],
  onChange,
  placeholder = "选择角色",
  disabled = false,
  className = "",
  excludeRoles = [],
  includeRoles = []
}: MultiRoleSelectorProps) {
  const { data: rolesData, isLoading, error } = useQuery({
    queryKey: ['roles', { limit: 100, isActive: true }],
    queryFn: async () => {
      const response: any = await rolesApi.getRoles({ limit: 100, isActive: true })
      let roles = response?.data?.roles || response?.roles || []
      
      if (excludeRoles.length > 0) {
        roles = roles.filter((role: Role) => !excludeRoles.includes(role.code))
      }
      
      if (includeRoles.length > 0) {
        roles = roles.filter((role: Role) => includeRoles.includes(role.code))
      }
      
      return roles
    }
  })

  const roles = rolesData || []

  const handleRoleToggle = (roleCode: string) => {
    const newValue = value.includes(roleCode)
      ? value.filter(code => code !== roleCode)
      : [...value, roleCode]
    onChange(newValue)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            加载角色列表失败
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3">
          {roles.map((role: Role) => (
            <div
              key={role.id}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => !disabled && handleRoleToggle(role.code)}
            >
              <input
                type="checkbox"
                checked={value.includes(role.code)}
                onChange={() => handleRoleToggle(role.code)}
                disabled={disabled}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">
                {role.name} ({role.code}) - 级别 {role.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 角色徽章组件
 * 用于显示用户角色信息
 */
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

  const role = roleData
  
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