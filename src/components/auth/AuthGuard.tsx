'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppStore } from '@/store'
import { initializeAuth, isAuthenticated } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireGuest?: boolean
}

/**
 * 认证保护组件
 * - requireAuth=true: 需要登录才能访问
 * - requireGuest=true: 需要未登录才能访问（如登录页）
 * - 都不设置：任何人都可以访问
 */
export function AuthGuard({ children, requireAuth, requireGuest }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    let isMounted = true
    
    const initAuth = async () => {
      try {
        if (!isInitialized) {
          // 只在未初始化时执行认证检查
          const authResult = await initializeAuth()
          if (isMounted) {
            setIsInitialized(true)
            console.log('认证初始化完成:', authResult)
          }
        }
      } catch (error) {
        console.error('认证初始化失败:', error)
        if (isMounted) {
          setIsInitialized(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    // 在客户端执行认证初始化
    if (typeof window !== 'undefined') {
      initAuth()
    } else {
      setIsLoading(false)
      setIsInitialized(true)
    }
    
    return () => {
      isMounted = false
    }
  }, [isInitialized])
  
  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">加载中...</span>
        </div>
      </div>
    )
  }
  
  const authenticated = isAuthenticated()
  
  // 如果需要认证但未登录，重定向到登录页
  if (requireAuth && !authenticated) {
    router.push('/login')
    return null
  }
  
  // 如果需要未登录但已登录，重定向到首页
  if (requireGuest && authenticated) {
    router.push('/')
    return null
  }
  
  return <>{children}</>
}