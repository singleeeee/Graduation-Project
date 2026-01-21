"use client"

import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMenuItems } from '@/hooks/use-permissions'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { ProfileDashboard } from '@/components/dashboard/ProfileDashboard'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAppStore()
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState('/profile')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])
  
  const menuItems = useMenuItems(currentPath)

  const handleLogout = async () => {
    try {
      await logout()
      router.replace('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      router.replace('/login')
    }
  }

  // 如果未认证，显示加载状态
  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在跳转到登录页...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      user={user}
      logout={handleLogout}
      menuItems={menuItems}
      title="个人信息"
      theme={user.role === 'admin' ? 'admin' : 'candidate'}
    >
      <div className="max-w-7xl mx-auto">
        <ProfileDashboard user={user} isEmbedded={true} />
      </div>
    </DashboardLayout>
  )
}