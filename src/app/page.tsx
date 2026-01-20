'use client'

import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { authApi } from '@/lib/api'
import { initializeAuth, isAuthenticated } from '@/lib/auth'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { CandidateDashboard } from '@/components/dashboard/CandidateDashboard'
import WelcomePage from '@/components/pages/WelcomePage'

export default function Home() {
  const { user, logout } = useAppStore();
  console.log('加载首页', user)

  // 服务端渲染期间，避免客户端和服务端内容不一致
  // 只在客户端执行认证检查
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    // 在组件挂载时初始化认证状态
    initializeAuth().catch(error => {
      console.error('认证初始化失败:', error)
    })
  }, [])

  // 服务端渲染时或客户端刚加载时，显示加载状态
  if (!isClient) {
    // 在服务端渲染期间，显示加载状态以避免hydration不匹配
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 只在客户端检查认证状态
  if (!authApi.isAuthenticated() || !isAuthenticated()) {
    return <WelcomePage />
  }

  // 根据用户角色显示不同页面（注意：如果用户信息不完整，使用默认角色）
  const userRole = user.role || 'candidate';
  
  if (userRole === 'candidate') {
    return <CandidateDashboard user={user} logout={logout} />
  }

  // 管理员页面
  return <AdminDashboard user={user} logout={logout} />
}