"use client"

import React, { useEffect } from 'react'
import { useAppStore } from '@/store'
import { ProfileLayout } from '@/components/layout/ProfileLayout'
import { useRouter } from 'next/navigation'
import { ProfileDashboard } from '@/components/dashboard/ProfileDashboard'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAppStore()
  const router = useRouter()

  // 设置独立的页面标题，确保不会随仪表盘改变
  useEffect(() => {
    // 设置文档标题
    document.title = '个人信息管理 - 招新管理系统'
    
    // 如果 ProfileLayout 没有正确显示（可能被 DashboardLayout 覆盖），尝试修复标题
    const checkAndFixTitle = () => {
      const profileTitleElement = document.querySelector('[data-profile-title]')
      
      if (!profileTitleElement) {
        // ProfileLayout 标题不存在，说明可能被 DashboardLayout 覆盖
        const dashboardTitleElement = document.querySelector('header h1')
        if (dashboardTitleElement && !dashboardTitleElement.getAttribute('data-profile-title')) {
          dashboardTitleElement.textContent = '个人信息管理'
          dashboardTitleElement.setAttribute('data-profile-title', 'true')
        }
      }
    }
    
    // 立即执行一次
    checkAndFixTitle()
    
    // 延迟再检查一次，确保 DOM 已完全加载
    const timeoutId = setTimeout(checkAndFixTitle, 100)
    
    // 添加 MutationObserver 监听标题变化，防止被其他组件覆盖
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
          const target = mutation.target as HTMLElement
          if (target.tagName === 'H1' && target.parentElement?.closest('header') && 
              !target.getAttribute('data-profile-title') && 
              !target.textContent?.includes('个人信息')) {
            target.textContent = '个人信息管理'
            target.setAttribute('data-profile-title', 'true')
          }
        }
      })
    })
    
    // 监听 header 元素的变化
    const headerElement = document.querySelector('header')
    if (headerElement) {
      observer.observe(headerElement, { childList: true, subtree: true })
    }
    
    // 清理函数
    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  // 如果未认证，显示加载状态
  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在跳转到登录页...</p>
        </div>
      </div>
    )
  }

  return (
    <ProfileLayout user={user}>
      <ProfileDashboard user={user} isEmbedded={true} />
    </ProfileLayout>
  )
}