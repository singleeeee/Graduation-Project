'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface User {
  id: string | null
  name: string | null
  email: string | null
  role: string | null
}

interface DashboardLayoutProps {
  user: User
  logout: () => void
  children: React.ReactNode
  menuItems: Array<{
    title: string
    icon: string
    href: string
    current: boolean
  }>
  title: string
  theme: 'admin' | 'candidate'
}

export function DashboardLayout({ user, logout, children, menuItems, title, theme }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const themeColors = {
    admin: {
      primary: 'blue',
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-50',
      active: 'bg-blue-50 text-blue-600 border-l-4 border-blue-600',
      logo: '招'
    },
    candidate: {
      primary: 'green',
      bg: 'bg-green-600',
      hover: 'hover:bg-green-50',
      active: 'bg-green-50 text-green-600 border-l-4 border-green-600',
      logo: '候'
    }
  }

  const currentTheme = themeColors[theme]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex-shrink-0
        lg:translate-x-0 lg:static lg:inset-0 h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${currentTheme.bg} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{currentTheme.logo}</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                {theme === 'admin' ? '招新管理系统' : '候选人中心'}
              </span>
            </div>
          </div>

          {/* 菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${item.current 
                    ? currentTheme.active 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* 移动端菜单按钮 */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1"></div>

            {/* 用户信息区域 */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || (theme === 'admin' ? '管理员' : '候选人')}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email || `${theme}@example.com`}
                </p>
              </div>
              
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${currentTheme.bg} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : (theme === 'admin' ? 'A' : 'C')}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="hidden sm:flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>退出</span>
                  </Button>

                  {/* 移动端退出按钮 */}
                  <button
                    type="button"
                    className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={logout}
                    title="退出登录"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
              <p className="mt-2 text-gray-600">
                {theme === 'admin' 
                  ? '欢迎使用招新管理系统' 
                  : '管理您的申请和查看最新进展'
                }
              </p>
            </div>
            
            {/* 子组件内容 */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}