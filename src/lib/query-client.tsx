'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { authApi } from './api'

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
          },
          mutations: {
            retry: 1,
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