'use client'

import { useState, createContext, useContext } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sidebar Context
interface SidebarContextType {
  isOpen: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

// Sidebar Components
interface SidebarProps {
  children: React.ReactNode
  className?: string
  theme: 'admin' | 'candidate'
}

export const SidebarContainer = ({ children, className = '', theme }: SidebarProps) => {
  const { isOpen } = useSidebar()
  
  const themeColors = {
    admin: 'bg-blue-600',
    candidate: 'bg-green-600'
  }

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0 h-screen
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${className}
    `}>
      {children}
    </div>
  )
}

export const SidebarHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex items-center justify-center h-16 px-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
)

export const SidebarContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <nav className={`flex-1 px-4 py-6 space-y-2 ${className}`}>
    {children}
  </nav>
)

export const SidebarFooter = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-6 py-4 border-t border-gray-200 mt-auto ${className}`}>
    {children}
  </div>
)

export const SidebarMenuItem = ({ 
  children, 
  className = '',
  active = false 
}: { 
  children: React.ReactNode, 
  className?: string,
  active?: boolean 
}) => (
  <div className={`
    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
    ${active 
      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 rounded-l-none' 
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }
    ${className}
  `}>
    {children}
  </div>
)

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
  const [isOpen, setIsOpen] = useState(false)
  const toggleSidebar = () => setIsOpen(!isOpen)

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
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      <div className="flex min-h-screen bg-gray-50">
      {/* 移动端侧边栏遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <SidebarContainer theme={theme}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <SidebarHeader>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${currentTheme.bg} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{currentTheme.logo}</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                {theme === 'admin' ? '招新管理系统' : '候选人中心'}
              </span>
            </div>
          </SidebarHeader>

          {/* Menu Content */}
          <SidebarContent>
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => {
                  // 在移动端点击菜单项时关闭侧边栏
                  if (window.innerWidth < 1024) {
                    toggleSidebar()
                  }
                }}
              >
                <SidebarMenuItem active={item.current}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuItem>
              </Link>
            ))}
          </SidebarContent>

          {/* Footer with user info */}
          <SidebarFooter>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${currentTheme.bg} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || (theme === 'admin' ? '管理员' : '候选人')}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || (theme === 'admin' ? 'admin@example.com' : 'candidate@example.com')}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={logout}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </Button>
            </div>
          </SidebarFooter>
        </div>
      </SidebarContainer>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-3"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-sm text-gray-500">
                欢迎回来，{user.name || (theme === 'admin' ? '管理员' : '您')}
              </span>
              <div className={`w-8 h-8 ${currentTheme.bg} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : (theme === 'admin' ? 'A' : 'C')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
    </SidebarContext.Provider>
  )
}