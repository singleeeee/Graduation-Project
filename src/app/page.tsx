'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { CandidateDashboard } from '@/components/dashboard/CandidateDashboard'

export default function Home() {
  const { user, logout } = useAppStore();
  console.log('加载首页', user)

  // 如果用户未登录，显示登录提示页面
  if (!user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-3xl">招</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              欢迎来到招新系统
            </h1>
            <p className="text-gray-600 mb-8">
              请先登录以访问您的个人页面
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/login">立即登录</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/register">新用户注册</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 根据用户角色显示不同页面
  if (user.role === 'candidate') {
    return <CandidateDashboard user={user} logout={logout} />
  }

  // 管理员页面
  return <AdminDashboard user={user} logout={logout} />
}