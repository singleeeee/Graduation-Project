import React from 'react'
import { GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">招新平台</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link href="/recruitment">
              <Button variant="ghost">浏览招新</Button>
            </Link>
            <Link href="/applications">
              <Button variant="ghost">我的申请</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">个人中心</Button>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* 主内容 */}
      <main>
        {children}
      </main>
    </div>
  )
}