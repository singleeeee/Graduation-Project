'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'

interface User {
  id: string | null
  name: string | null
  email: string | null
  role: string | null
}

interface CandidateDashboardProps {
  user: User
  logout: () => void
}

export function CandidateDashboard({ user, logout }: CandidateDashboardProps) {
  const candidateMenuItems = [
    {
      title: '我的申请',
      icon: '📝',
      href: '/application',
      current: true
    },
    {
      title: '个人信息',
      icon: '👤',
      href: '/profile',
      current: false
    },
    {
      title: '面试安排',
      icon: '📅',
      href: '/interviews',
      current: false
    },
    {
      title: '申请记录',
      icon: '📋',
      href: '/history',
      current: false
    }
  ]

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      menuItems={candidateMenuItems}
      title="候选人中心"
      theme="candidate"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            欢迎回来，{user.name || '候选人'}！
          </h1>
          <p className="mt-2 text-gray-600">管理您的申请和查看最新进展</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">申请状态</p>
                <p className="text-lg font-bold text-green-600">审核中</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">申请职位</p>
                <p className="text-lg font-bold text-gray-900">前端开发</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">提交时间</p>
                <p className="text-lg font-bold text-gray-900">3天前</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">查看次数</p>
                <p className="text-lg font-bold text-gray-900">12次</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">申请进度</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">提交申请</p>
                <p className="text-xs text-gray-500">2024年1月3日 14:30</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">简历初审</p>
                <p className="text-xs text-gray-500">2024年1月4日 09:15</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">技术面试</p>
                <p className="text-xs text-gray-500">进行中...</p>
              </div>
            </div>

            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">最终结果</p>
                <p className="text-xs text-gray-500">待定</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
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
        </div>
      </div>
    </DashboardLayout>
  )
}