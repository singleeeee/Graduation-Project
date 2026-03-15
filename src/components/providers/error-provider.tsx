"use client"

import React, { createContext, useContext, useEffect } from 'react'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

interface ErrorContextType {
  showError: (error: any, customMessage?: string) => void
  showSuccess: (description: string, title?: string) => void
  showWarning: (description: string, title?: string) => void
  showInfo: (description: string, title?: string) => void
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export function useGlobalError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useGlobalError must be used within an ErrorProvider')
  }
  return context
}

interface ErrorProviderProps {
  children: React.ReactNode
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const errorHandler = useErrorHandler()
  const { reset } = useQueryErrorResetBoundary()
  
  useEffect(() => {
    // 全局错误处理：监听window上的错误事件（仅处理非 API 的运行时错误）
    const handleError = (event: ErrorEvent) => {
      if (event.error && !event.error.isApiError) {
        errorHandler.showError(event.error, '应用发生错误')
      }
    }
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      // 跳过 API 错误（已由 axios 拦截器或 React Query onError 处理）
      // 跳过普通的 Error 对象（登录/请求失败等业务错误，已由各自页面处理）
      if (!error || error.isApiError) return
      // 只处理非 HTTP 响应类的真正未捕获异常
      if (error?.response) return
      errorHandler.showError(error, '异步操作发生错误')
    }
    
    // API错误处理：监听来自axios拦截器的错误事件（仅 5xx 和网络错误）
    const handleApiError = (event: CustomEvent) => {
      const { message } = event.detail
      errorHandler.showError({ message }, message)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('api-error', handleApiError as EventListener)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('api-error', handleApiError as EventListener)
    }
  }, [errorHandler])
  
  const value: ErrorContextType = {
    showError: errorHandler.showError,
    showSuccess: errorHandler.showSuccess,
    showWarning: errorHandler.showWarning,
    showInfo: errorHandler.showInfo,
  }
  
  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}