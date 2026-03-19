import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api'
import type { 
  ApplicationQueryParams, 
  MyApplicationsQueryParams,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  Application,
  ApplicationDetail,
  DashboardResponse
} from '@/lib/api'

/**
 * 申请相关的React Query钩子
 */

/**
 * 获取申请列表Hook
 */
export function useApplications(params?: ApplicationQueryParams) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => applicationsApi.getApplications(params),
    select: (response) => ({
      applications: response.data,
      pagination: response.pagination
    }),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
}

/**
 * 获取我的申请Hook
 */
export function useMyApplications(params?: MyApplicationsQueryParams) {
  return useQuery({
    queryKey: ['myApplications', params],
    queryFn: () => applicationsApi.getMyApplications(params),
    select: (response) => ({
      applications: response.data || [],
      pagination: response.pagination
    }),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })
}

/**
 * 获取申请详情Hook
 */
export function useApplicationDetail(id: string) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getApplication(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
}

/**
 * 创建申请Hook
 */
export function useCreateApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationsApi.createApplication(data),
    onSuccess: () => {
      // 成功后刷新我的申请列表
      queryClient.invalidateQueries({ queryKey: ['myApplications'] })
    }
  })
}

/**
 * 更新申请状态Hook
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationStatusRequest }) => 
      applicationsApi.updateApplicationStatus(id, data),
    onSuccess: (_, { id }) => {
      // 成功后刷新相关的查询
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['myApplications'] })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
    }
  })
}

/**
 * 获取仪表盘统计数据 Hook
 */
export function useAdminDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['adminDashboard'],
    queryFn: () => applicationsApi.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    retry: 1,
  })
}

/**
 * 删除申请Hook
 */
export function useDeleteApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => applicationsApi.deleteApplication(id),
    onSuccess: () => {
      // 成功后刷新申请列表
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['myApplications'] })
    }
  })
}

/**
 * 手动触发 AI 评估 Hook（管理员）
 * 触发后轮询该申请详情，直到 aiScore 有值（最多等 30s）
 * 额外暴露 isPolling / pollingId，供 UI 显示骨架屏
 */
export function useTriggerAiEvaluate() {
  const queryClient = useQueryClient()
  // 正在轮询的申请 id（null 表示未在轮询）
  const [pollingId, setPollingId] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (id: string) => applicationsApi.triggerAiEvaluate(id),
    onSuccess: (_, id) => {
      setPollingId(id)
      let attempts = 0
      const maxAttempts = 10 // 最多 10 次 × 3s = 30s

      const poll = async () => {
        attempts++
        await queryClient.invalidateQueries({ queryKey: ['application', id] })
        await queryClient.invalidateQueries({ queryKey: ['applications'] })

        const cached = queryClient.getQueryData<ApplicationDetail>(['application', id])
        if (cached?.aiScore != null || attempts >= maxAttempts) {
          setPollingId(null)
          return
        }
        setTimeout(poll, 3000)
      }

      setTimeout(poll, 3000)
    },
    onError: () => {
      setPollingId(null)
    },
  })

  return {
    ...mutation,
    /** 当前正在轮询等待结果的申请 id */
    pollingId,
    /** 是否正在等待某个申请的 AI 结果 */
    isPolling: pollingId !== null,
    /** 判断指定 id 是否正在轮询 */
    isPollingFor: (id: string) => pollingId === id,
  }
}