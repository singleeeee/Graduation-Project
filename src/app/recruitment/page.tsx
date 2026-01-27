'use client'

import { useAppStore } from '@/store'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { CandidateDashboard } from '@/components/dashboard/CandidateDashboard'
import { RecruitmentPageContent } from '@/components/recruitment/RecruitmentPageContent'

export default function RecruitmentPage() {
  return (
    <AuthGuard requireAuth>
      <RecruitmentDashboard />
    </AuthGuard>
  )
}

function RecruitmentDashboard() {
  const { user, logout } = useAppStore()
  
  const candidateMenuItems = [
    {
      title: '招新信息',
      icon: '🎯',
      href: '/recruitment',
      current: true
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
      overrideContent={<RecruitmentPageContent />}
      menuItems={candidateMenuItems}
    />
  )
}