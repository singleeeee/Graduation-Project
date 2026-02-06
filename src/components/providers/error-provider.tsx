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
    // 全局错误处理：监听window上的错误事件
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      // 只显示非API相关的错误
      if (event.error && !event.error.isApiError) {
        errorHandler.showError(event.error, '应用发生错误')
      }
    }
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      // 只显示非API相关的错误
      const error = event.reason
      if (error && !error.isApiError) {
        errorHandler.showError(error, '异步操作发生错误')
      }
    }
    
    // API错误处理：监听来自axios拦截器的错误事件
    const handleApiError = (event: CustomEvent) => {
      const { message } = event.detail
      console.error('API Error detected:', message)
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