import React from 'react'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  // 直接返回子组件，让个人资料页面使用DashboardLayout
  return <>{children}</>
}