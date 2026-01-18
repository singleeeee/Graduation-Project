import type { Metadata } from 'next'
import { AdminLayoutClient } from './AdminLayoutClient'

export const metadata: Metadata = {
  title: '超级管理员后台',
  description: '招新系统超级管理员后台',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}