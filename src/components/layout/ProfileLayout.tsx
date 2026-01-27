"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { logout } from '@/lib/auth'

interface User {
  id: string | null
  name: string | null
  email: string | null
  role: string | {
    id: string
    name: string
    code: string
    level: number
    permissions: string[]
  } | null
  permissions?: string[]
}

interface ProfileLayoutProps {
  user: User
  children: React.ReactNode
}

export function ProfileLayout({ user, children }: ProfileLayoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.replace('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      router.replace('/login')
    }
  }

  const handleBackToDashboard = () => {
    // 根据用户角色返回到对应的主页仪表盘
    const dashboardPath = user.role === 'admin' ? '/admin' : '/'
    router.push(dashboardPath)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900" data-profile-title>
                  个人信息管理
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                欢迎，{user.name || (user.role === 'admin' ? '管理员' : '用户')}
              </span>
              <div className={`w-8 h-8 ${user.role === 'admin' ? 'bg-blue-600' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : (user.role === 'admin' ? 'A' : 'U')}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToDashboard}
                >
                  返回首页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  退出
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}