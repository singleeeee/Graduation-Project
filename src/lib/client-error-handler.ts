// 客户端错误处理服务
// 这个文件专门用于在客户端环境中处理API错误并显示toast

import { expandedToast } from '@/hooks/use-toast'
import { globalErrorHandler } from './utils/error-handler'

// 全局错误处理函数 - 可以在客户端调用来显示错误
export function showClientError(error: any, customMessage?: string) {
  if (typeof window === 'undefined') {
    // 服务器端只记录错误
    console.error('Server-side API Error:', error)
    return
  }
  
  try {
    const errorMessage = globalErrorHandler.handleApiError(error, customMessage)
    expandedToast.error(errorMessage, '错误')
  } catch (e) {
    console.error('Error showing client toast:', e)
  }
}

// 全局成功提示
export function showClientSuccess(description: string, title: string = '成功') {
  if (typeof window === 'undefined') return
  try {
    expandedToast.success(description, title)
  } catch (e) {
    console.error('Error showing client success toast:', e)
  }
}

// 全局警告提示
export function showClientWarning(description: string, title: string = '警告') {
  if (typeof window === 'undefined') return
  try {
    expandedToast.warning(description, title)
  } catch (e) {
    console.error('Error showing client warning toast:', e)
  }
}

// 全局信息提示
export function showClientInfo(description: string, title: string = '提示') {
  if (typeof window === 'undefined') return
  try {
    expandedToast.info(description, title)
  } catch (e) {
    console.error('Error showing client info toast:', e)
  }
}