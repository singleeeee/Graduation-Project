"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMenuItems } from '@/hooks/use-permissions'
import { logout } from '@/lib/auth'
import { useAppStore } from '@/store'

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useAppStore()
  const router = useRouter()
  const currentPath = usePathname()

  // 如果用户未认证，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  const menuItems = useMenuItems(currentPath)
  
  const handleLogout = async () => {
    try {
      // 使用完整的退出流程
      await logout()
      // 退出后重定向到登录页
      router.replace('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      // 即使失败也重定向到登录页
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
      title="超级管理员后台"
      theme="admin"
    >
      {children}
    </DashboardLayout>
  )
}