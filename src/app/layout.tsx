import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-client'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { ErrorProvider } from '@/components/providers/error-provider'
import { Toaster } from 'sonner'

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
            <Toaster richColors position="top-right" />
          </ErrorProvider>
        </QueryProvider>
      </body>
    </html>
  )
}