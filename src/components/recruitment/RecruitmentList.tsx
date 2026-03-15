"use client"

import React, { useState } from 'react'
import { Search, SlidersHorizontal, Inbox, AlertCircle } from 'lucide-react'
import { usePublicRecruitments } from '@/hooks/use-recruitment'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { RecruitmentCard } from './RecruitmentCard'
import type { RecruitmentQueryParams } from '@/lib/api/recruitment/types'

interface RecruitmentListProps {
  initialPage?: number
  initialSearch?: string
}

export function RecruitmentList({ initialPage = 1, initialSearch = '' }: RecruitmentListProps) {
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState<string>('')

  const queryParams: RecruitmentQueryParams = {
    page,
    limit: 12,
    search: search || undefined,
    status: status as any || undefined,
  }

  const { data, isLoading, isError } = usePublicRecruitments(queryParams)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatus(value === 'all' ? '' : value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const recruitments = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* 搜索和过滤栏 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="搜索招新标题或社团名称..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <Select value={status || 'all'} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="招新状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
              <SelectItem value="ongoing">招新中</SelectItem>
              <SelectItem value="finished">已结束</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 加载骨架屏 */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-100 overflow-hidden">
              <Skeleton className="h-24 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-8 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 错误状态 */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">加载失败</h3>
          <p className="text-sm text-gray-500">网络出现问题，请稍后刷新重试</p>
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && !isError && recruitments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Inbox className="h-7 w-7 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">暂无招新信息</h3>
          <p className="text-sm text-gray-500">目前还没有符合条件的招新批次，请稍后再来</p>
          {(search || status) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => { setSearch(''); setStatus(''); setPage(1); }}
            >
              清除筛选条件
            </Button>
          )}
        </div>
      )}

      {/* 列表 */}
      {!isLoading && !isError && recruitments.length > 0 && (
        <>
          {/* 结果数量提示 */}
          {pagination && (
            <p className="text-sm text-gray-500">
              共找到 <span className="font-medium text-gray-900">{pagination.total}</span> 个招新批次
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recruitments.map((recruitment) => (
              <RecruitmentCard key={recruitment.id} recruitment={recruitment} />
            ))}
          </div>

          {/* 分页 */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                上一页
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum: number
                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
