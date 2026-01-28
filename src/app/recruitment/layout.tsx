'use client'

import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store'
import { useMenuItems } from '@/hooks/use-permissions'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface RecruitmentLayoutProps {
  children: React.ReactNode
}

function RecruitmentDashboardWrapper({ children }: RecruitmentLayoutProps) {
  const { user, logout, isAdmin, isCandidate, isInterviewer } = useAppStore()
  const pathname = usePathname()
  const menuItems = useMenuItems(pathname)
  
  // 根据用户角色确定主题类型
  const getTheme = () => {
    if (isAdmin()) return 'admin'
    if (isInterviewer()) return 'admin' // 面试官也使用admin主题
    return 'candidate'
  }
  
  // 根据用户角色确定标题
  const getTitle = () => {
    return '招新信息'
  }

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      menuItems={menuItems}
      title={getTitle()}
      theme={getTheme()}
    >
      {children}
    </DashboardLayout>
  )
}

export default function RecruitmentLayout({ children }: RecruitmentLayoutProps) {
  return (
    <AuthGuard requireAuth>
      <RecruitmentDashboardWrapper>
        {children}
      </RecruitmentDashboardWrapper>
    </AuthGuard>
  )
}