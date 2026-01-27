'use client'

import { useAppStore } from '@/store'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { CandidateDashboard } from '@/components/dashboard/CandidateDashboard'

interface RecruitmentLayoutProps {
  children: React.ReactNode
}

function RecruitmentDashboardWrapper({ children }: RecruitmentLayoutProps) {
  const { user, logout } = useAppStore()
  
  const candidateMenuItems = [
    {
      title: '招新信息',
      icon: '🎯',
      href: '/recruitment',
      current: true // 因为在recruitment页面下，这个菜单项总是当前项
    },
    {
      title: '我的申请',
      icon: '📝',
      href: '/application',
      current: false
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
    <CandidateDashboard 
      user={user} 
      logout={logout}
      overrideContent={children}
      menuItems={candidateMenuItems}
    />
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