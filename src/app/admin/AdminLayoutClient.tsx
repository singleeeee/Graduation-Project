"use client"

import { usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMenuItems } from '@/hooks/use-permissions'

// 模拟用户数据，实际应该从认证系统获取
function getUserFromAuth() {
  // 这里应该从实际的身份验证系统中获取用户信息
  // 暂时返回模拟数据
  return {
    id: 'admin-1',
    name: '超级管理员',
    email: 'admin@example.com',
    role: 'system_admin'
  }
}

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const user = getUserFromAuth()

  // 获取当前路径用于菜单高亮
  const currentPath = usePathname()
  
  const menuItems = useMenuItems(currentPath)
  
  const handleLogout = () => {
    // 处理登出逻辑
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <DashboardLayout
      user={user}
      logout={handleLogout}
      menuItems={menuItems}
      title="超级管理员后台"
      theme="admin"
    >
      {children}
    </DashboardLayout>
  )
}