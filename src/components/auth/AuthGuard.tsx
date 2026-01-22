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
  
  // 首先检查是否已有用户信息（快速路径）
  const { user: currentUser } = useAppStore.getState()
  const hasUserInfo = currentUser && currentUser.id && currentUser.email
  
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout
    
    const initAuth = async () => {
      try {
        // 如果已经有用户信息，跳过后端API调用
        if (hasUserInfo) {
          console.log('AuthGuard: 已有用户信息，跳过认证初始化')
          if (isMounted) {
            setIsInitialized(true)
            setIsLoading(false)
          }
          return
        }
        
        // 设置超时保护，避免无限等待
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('认证初始化超时，跳过认证检查')
            setIsInitialized(true)
            setIsLoading(false)
          }
        }, 3000) // 3秒超时
        
        // 只在必要时执行认证检查
        const authResult = await initializeAuth()
        if (isMounted) {
          clearTimeout(timeoutId)
          setIsInitialized(true)
          console.log('认证初始化完成:', authResult)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('认证初始化失败:', error)
        if (isMounted) {
          clearTimeout(timeoutId)
          setIsInitialized(true)
          setIsLoading(false)
        }
      }
    }
    
    // 在客户端执行认证初始化，但只在首次加载时执行
    if (typeof window !== 'undefined' && !isInitialized) {
      initAuth()
    } else {
      setIsLoading(false)
      setIsInitialized(true)
    }
    
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [hasUserInfo, isInitialized])

  // 实时计算认证状态
  const authenticated = isAuthenticated()

  // 如果需要未登录但已登录，重定向到首页
  useEffect(() => {
    if (requireGuest && authenticated) {
      router.push('/')
    }
  }, [requireGuest, authenticated, router])
  
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
  
  // 如果需要认证但未登录，重定向到登录页
  if (requireAuth && !authenticated) {
    router.push('/login')
    return null
  }

  if (requireGuest && authenticated) {
    return null
  }
  
  return <>{children}</>
}