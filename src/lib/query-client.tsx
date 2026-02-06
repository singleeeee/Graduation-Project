'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { authApi } from './api'
import { globalErrorHandler } from './utils/error-handler'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分钟后数据过期
            refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
            retry: (failureCount, error: any) => {
              // 不重试401错误（认证错误）
              if (error?.response?.status === 401) {
                return false
              }
              // 网络错误重试一次
              return failureCount < 1
            },
            // 全局查询错误处理
            onError: (error: any) => {
              // 标记为API错误，避免被其他全局错误处理器重复处理
              if (error) {
                (error as any).isApiError = true
              }
              
              // 在生产环境中自动显示错误提示，开发环境中由开发者通过useErrorHandler控制
              if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
                const errorMessage = globalErrorHandler.handleApiError(error)
                // 注意：这里不能直接调用toast，需要在组件中使用useErrorHandler
                console.error('Query error:', errorMessage)
              }
            },
          },
          mutations: {
            retry: 1,
            // 全局mutation错误处理
            onError: (error: any) => {
              // 标记为API错误，避免被其他全局错误处理器重复处理
              if (error) {
                (error as any).isApiError = true
              }
              
              // 在生产环境中自动显示错误提示，开发环境中由开发者通过useErrorHandler控制
              if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
                const errorMessage = globalErrorHandler.handleApiError(error)
                // 注意：这里不能直接调用toast，需要在组件中使用useErrorHandler
                console.error('Mutation error:', errorMessage)
              }
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}