'use client'

import { useAppStore } from '@/store'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { CandidateDashboard } from '@/components/dashboard/CandidateDashboard'
import WelcomePage from '@/components/pages/WelcomePage'

export default function Home() {
  const { user, logout } = useAppStore();
  console.log('加载首页', user)

  // 如果用户未登录，显示欢迎页面
  if (!user.id) {
    return <WelcomePage />
  }

  // 根据用户角色显示不同页面
  if (user.role === 'candidate') {
    return <CandidateDashboard user={user} logout={logout} />
  }

  // 管理员页面
  return <AdminDashboard user={user} logout={logout} />
}