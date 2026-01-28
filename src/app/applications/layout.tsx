'use client'

import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store'
import { useMenuItems } from '@/hooks/use-permissions'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface ApplicationsLayoutProps {
  children: React.ReactNode
}

function ApplicationsLayoutWrapper({ children }: ApplicationsLayoutProps) {
  const { user, logout, isAdmin } = useAppStore()
  const pathname = usePathname()
  const menuItems = useMenuItems(pathname)
  
  // 根据用户角色确定主题
  const theme = isAdmin() ? 'admin' : 'candidate'
  
  // 设置页面标题
  const getTitle = () => {
    if (pathname === '/applications/new') return '提交申请'
    return '我的申请'
  }

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      menuItems={menuItems}
      title={getTitle()}
      theme={theme}
    >
      {children}
    </DashboardLayout>
  )
}

export default function ApplicationsLayout({ children }: ApplicationsLayoutProps) {
  return (
    <AuthGuard requireAuth>
      <ApplicationsLayoutWrapper>
        {children}
      </ApplicationsLayoutWrapper>
    </AuthGuard>
  )
}