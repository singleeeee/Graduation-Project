"use client"

import { toast } from 'sonner'
import { globalErrorHandler } from '@/lib/utils/error-handler'

export function useErrorHandler() {
  return {
    showError: (error: any, customMessage?: string) => {
      const errorMessage = globalErrorHandler.handleApiError(error, customMessage)
      toast.error('错误', { description: errorMessage })
    },
    showMessage: (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
      if (variant === 'destructive') {
        toast.error(title, { description })
      } else {
        toast(title, { description })
      }
    },
    showSuccess: (description: string, title: string = '成功') => {
      toast.success(title, { description })
    },
    showWarning: (description: string, title: string = '警告') => {
      toast.warning(title, { description })
    },
    showInfo: (description: string, title: string = '提示') => {
      toast.info(title, { description })
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
