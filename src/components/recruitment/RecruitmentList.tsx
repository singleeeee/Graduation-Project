"use client"

import React, { useState } from 'react'
import { Search, Filter } from 'lucide-react'
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
import { recruitmentApi } from '@/lib/api'
import type { RecruitmentQueryParams } from '@/lib/api/recruitment/types'

interface RecruitmentListProps {
  initialPage?: number
  initialSearch?: string
}

export function RecruitmentList({ initialPage = 1, initialSearch = '' }: RecruitmentListProps) {
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('startTime')

  const queryParams: RecruitmentQueryParams = {
    page,
    limit: 12,
    search: search || undefined,
    status: status as any || undefined
  }

  const { data, isLoading, isError } = usePublicRecruitments(queryParams)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1) // 重置到第一页
  }

  const handleStatusFilter = (value: string) => {
    setStatus(value === 'all' ? '' : value)
    setPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const recruitments = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索招新标题或社团名称..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={status} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[130px]">
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

      {/* 招新列表 */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-[200px] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500">加载失败，请稍后重试</p>
        </div>
      )}

      {recruitments.length === 0 && !isLoading && !isError && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无招新信息</h3>
          <p className="text-gray-500">目前还没有符合条件的招新批次</p>
        </div>
      )}

      {recruitments.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruitments.map((recruitment) => (
              <RecruitmentCard key={recruitment.id} recruitment={recruitment} />
            ))}
          </div>

          {/* 分页 */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                上一页
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
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