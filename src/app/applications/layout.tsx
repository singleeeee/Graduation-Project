'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { useMenuItems } from '@/hooks/use-permissions'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { logout as authLogout } from '@/lib/auth'

interface ApplicationsLayoutProps {
  children: React.ReactNode
}

function ApplicationsLayoutWrapper({ children }: ApplicationsLayoutProps) {
  const { user, isAdmin } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const menuItems = useMenuItems(pathname)
  
  const handleLogout = async () => {
    await authLogout()
    router.replace('/login')
  }

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
      logout={handleLogout}
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