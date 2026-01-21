'use client'

import React from 'react'
import { useAppStore } from '@/store'
import { authApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { CandidateDashboard } from '@/components/dashboard/CandidateDashboard'
import WelcomePage from '@/components/pages/WelcomePage'

export default function Home() {
  const { user, logout } = useAppStore();
  
  // 检查用户是否已认证，如果已认证则显示对应仪表盘
  if (isAuthenticated()) {
    // 根据用户角色显示不同页面（注意：如果用户信息不完整，使用默认角色）
    const userRole = user.role || 'candidate';
    
    if (userRole === 'candidate') {
      return (
        <AuthGuard requireAuth>
          <CandidateDashboard user={user} logout={logout} />
        </AuthGuard>
      )
    }
    
    // 管理员页面
    return (
      <AuthGuard requireAuth>
        <AdminDashboard user={user} logout={logout} />
      </AuthGuard>
    )
  }
  
  // 未认证用户显示欢迎页面
  return <WelcomePage />
}