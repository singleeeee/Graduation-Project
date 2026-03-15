'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分钟后数据过期
            refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
            retry: (failureCount, error: any) => {
              // 不重试 4xx 错误（业务错误，无需重试）
              if (error?.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                return false
              }
              // 网络错误重试一次
              return failureCount < 1
            },
          },
          mutations: {
            // 不重试 mutation，登录/提交等操作失败应由用户决定是否重试
            retry: false,
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
