"use client"

import { useEffect } from 'react'
import { toast } from './use-toast'
import { globalErrorHandler } from '@/lib/utils/error-handler'

export function useErrorHandler() {
  return {
    showError: (error: any, customMessage?: string) => {
      const errorMessage = globalErrorHandler.handleApiError(error, customMessage)
      toast({
        title: '错误',
        description: errorMessage,
        variant: 'destructive',
      })
    },
    showMessage: (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
      toast({
        title,
        description,
        variant,
      })
    },
    showSuccess: (description: string, title: string = '成功') => {
      toast({
        title,
        description,
        variant: 'default',
      })
    },
    showWarning: (description: string, title: string = '警告') => {
      toast({
        title,
        description,
        variant: 'default',
      })
    },
    showInfo: (description: string, title: string = '提示') => {
      toast({
        title,
        description,
        variant: 'default',
      })
    }
  }
}

// 创建一个高阶组件，用于自动处理React Query中的错误
export function useErrorBoundary() {
  const { showError } = useErrorHandler()
  
  return {
    handleError: (error: any) => {
      if (error) {
        showError(error)
      }
    },
    onError: (error: any) => {
      showError(error)
    }
  }
}