import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-client'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { ErrorProvider } from '@/components/providers/error-provider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '招新管理系统',
  description: '基于Next.js的招新管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <QueryProvider>
          <ErrorProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            {/* 支持两种 toast 系统 */}
            <Toaster />
            <SonnerToaster position="top-right" />
          </ErrorProvider>
        </QueryProvider>
      </body>
    </html>
  )
}