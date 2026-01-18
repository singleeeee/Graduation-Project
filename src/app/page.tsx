'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { CandidateDashboard } from '@/components/dashboard/CandidateDashboard'

export default function Home() {
  const { user, logout } = useAppStore();
  console.log('加载首页', user)

  // 如果用户未登录，显示登录提示页面
  if (!user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full">
          <Card className="backdrop-blur-sm bg-white/70">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-3xl">招</span>
              </div>
              <CardTitle className="text-3xl">欢迎来到招新系统</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                请先登录以访问您的个人页面
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/login">立即登录</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/register">新用户注册</Link>
              </Button>
            </CardContent>
          </Card>
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