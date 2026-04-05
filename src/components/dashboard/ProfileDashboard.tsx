'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProfile } from '@/hooks/use-profile'
import ProfileForm from '@/app/profile/ProfileForm'

interface User {
  id: string | null
  name: string | null
  email: string | null
  role: string | {
    id: string
    name: string
    code: string
    permissions: string[]
  } | null
  permissions?: string[]
}

interface ProfileDashboardProps {
  user: User
  isEmbedded?: boolean
}

export function ProfileDashboard({ user, isEmbedded = false }: ProfileDashboardProps) {
  const { data: profile, isLoading, error } = useProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载个人信息...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">加载个人信息失败</div>
        <p className="text-gray-600">请刷新页面重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 只有在非嵌入式模式下显示页面标题 */}
      {!isEmbedded && (
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">个人信息</h1>
          <p className="mt-2 text-gray-600">管理您的个人资料和申请信息</p>
        </div>
      )}

      {/* 嵌入式模式下传递 isEmbedded 属性给 ProfileForm */}
      <ProfileForm isEmbedded={isEmbedded} />
    </div>
  )
}