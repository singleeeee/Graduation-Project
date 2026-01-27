'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface CandidateDashboardProps {
  user: User
  logout: () => void
  overrideContent?: React.ReactNode
  menuItems?: Array<{
    title: string
    icon: string
    href: string
    current: boolean
  }>
}

export function CandidateDashboard({ 
  user, 
  logout, 
  overrideContent, 
  menuItems: propsMenuItems 
}: CandidateDashboardProps) {
  // 获取当前路径用于菜单高亮
  const pathname = usePathname()
  
  // 使用传入的菜单项或使用默认菜单项
  const menuItems = propsMenuItems || [
    {
      title: '招新信息',
      icon: '🎯',
      href: '/recruitment',
      current: pathname === '/recruitment'
    },
    {
      title: '我的申请',
      icon: '📝',
      href: '/application',
      current: pathname === '/application'
    },
    {
      title: '个人信息',
      icon: '👤',
      href: '/profile',
      current: pathname === '/profile'
    },
    {
      title: '面试安排',
      icon: '📅',
      href: '/interviews',
      current: pathname === '/interviews'
    },
    {
      title: '申请记录',
      icon: '📋',
      href: '/history',
      current: pathname === '/history'
    }
  ]

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      menuItems={menuItems}
      title="候选人中心"
      theme="candidate"
    >
      <div className="max-w-7xl mx-auto">
        {overrideContent ? (
          // 显示传入的内容（如招新页面）
          <>{overrideContent}</>
        ) : (
          // 显示默认的仪表盘内容
          <>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                欢迎回来，{user.name || '候选人'}！
              </h1>
              <p className="mt-2 text-gray-600">管理您的申请和查看最新进展</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">申请状态</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">📝</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">审核中</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">申请职位</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">前端开发</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">提交时间</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3天前</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">查看次数</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-xl">👁️</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12次</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>申请进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium">提交申请</p>
                      <p className="text-xs text-muted-foreground">2024年1月3日 14:30</p>
                    </div>
                    <Badge>已完成</Badge>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium">简历初审</p>
                      <p className="text-xs text-muted-foreground">2024年1月4日 09:15</p>
                    </div>
                    <Badge>已完成</Badge>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium">技术面试</p>
                      <p className="text-xs text-muted-foreground">进行中...</p>
                    </div>
                    <Badge variant="secondary">进行中</Badge>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">最终结果</p>
                      <p className="text-xs text-muted-foreground">待定</p>
                    </div>
                    <Badge variant="outline">等待中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                    <span className="text-2xl">📝</span>
                    <span>编辑申请</span>
                  </Button>
                  <Button className="h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                    <span className="text-2xl">📄</span>
                    <span>下载简历</span>
                  </Button>
                  <Button className="h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                    <span className="text-2xl">📧</span>
                    <span>联系我们</span>
                  </Button>
                  <Button className="h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                    <span className="text-2xl">❓</span>
                    <span>常见问题</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}