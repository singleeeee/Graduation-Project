export interface ApiError {
  message: string
  error?: string
  statusCode?: number
}

export function extractErrorMessage(error: any, customMessage?: string): string {
  let errorMessage = customMessage || '操作失败，请稍后重试'
  
  // 从不同格式的错误响应中提取错误信息
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message
  } else if (error?.response?.data?.error) {
    errorMessage = error.response.data.error
  } else if (error?.message) {
    errorMessage = error.message
  } else if (error instanceof Error) {
    errorMessage = error.message
  }
  
  // 对于特定的HTTP状态码，提供更有针对性的错误信息
  const statusCode = error?.response?.status
  if (statusCode) {
    switch (statusCode) {
      case 401:
        errorMessage = '无效或过期的访问令牌，请重新登录'
        break
      case 403:
        errorMessage = '没有权限执行此操作'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        break
      case 422:
        errorMessage = '数据验证失败，请检查输入'
        break
      case 500:
        errorMessage = '服务器内部错误，请稍后重试'
        break
      case 502:
        errorMessage = '服务暂时不可用，请稍后重试'
        break
      case 503:
        errorMessage = '服务维护中，请稍后重试'
        break
    }
  }
  
  return errorMessage
}

export function handleApiError(error: any, customMessage?: string): string {
  console.error('API Error:', error)
  return extractErrorMessage(error, customMessage)
}

// 创建一个可以在组件外部使用的全局错误处理器
export const globalErrorHandler = {
  handleApiError: (error: any, customMessage?: string) => {
    return handleApiError(error, customMessage)
  },
  extractErrorMessage: (error: any, customMessage?: string) => {
    return extractErrorMessage(error, customMessage)
  }
}