import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentApi } from '@/lib/api'
import type { RecruitmentQueryParams, UpdateRecruitmentStatusRequest, CreateRecruitmentBatchRequest } from '@/lib/api/recruitment/types'

/**
 * 候选人和公开可访问的招新相关Hook
 */

export function usePublicRecruitments(params?: RecruitmentQueryParams) {
  return useQuery({
    queryKey: ['publicRecruitments', params],
    queryFn: () => recruitmentApi.getPublicRecruitments(params),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    select: (data) => data.data
  })
}

export function usePublicRecruitment(id: string) {
  return useQuery({
    queryKey: ['publicRecruitment', id],
    queryFn: () => recruitmentApi.getRecruitment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    select: (data) => data.data
  })
}

/**
 * 管理员使用的招新相关Hook
 */

export function useRecruitments(params?: RecruitmentQueryParams) {
  return useQuery({
    queryKey: ['recruitments', params],
    queryFn: () => recruitmentApi.getRecruitments(params),
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    select: (data) => data.data
  })
}

export function useRecruitment(id: string) {
  return useQuery({
    queryKey: ['recruitment', id],
    queryFn: () => recruitmentApi.getRecruitment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    select: (data) => data.data
  })
}

/**
 * 获取招新统计数据
 */
export function useRecruitmentStats() {
  return useQuery({
    queryKey: ['recruitmentStats'],
    queryFn: async () => {
      // TODO: 实现统计数据接口
      return {
        activeClubs: 50,
        totalRecruitments: 200,
        totalApplications: 5000,
        acceptanceRate: 65
      }
    }
  })
}

/**
 * 管理端使用的mutation hooks
 */

export function useUpdateRecruitmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecruitmentStatusRequest }) =>
      recruitmentApi.updateRecruitmentStatus(id, data),
    onSuccess: (data) => {
      // 状态更新后刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['recruitments'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment', data.data?.id] })
    },
  })
}

export function useDeleteRecruitment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => 
      recruitmentApi.deleteRecruitment(id).then(() => id),
    onSuccess: () => {
      // 删除成功后刷新招新列表
      queryClient.invalidateQueries({ queryKey: ['recruitments'] })
    },
  })
}

export function useCreateRecruitmentBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecruitmentBatchRequest) =>
      recruitmentApi.createRecruitmentBatch(data),
    onSuccess: () => {
      // 创建成功后刷新招新列表
      queryClient.invalidateQueries({ queryKey: ['recruitments'] })
    },
  })
}

// 管理员使用的Hook - 添加缺失的导出
export function useClubsForSelection() {
  return useQuery({
    queryKey: ['clubsForSelection'],
    queryFn: () => {
      // TODO: 实现社团选择列表接口
      return []
    },
    select: (data) => data?.data || []
  })
}

export function useRegistrationFieldsForSelection() {
  return useQuery({
    queryKey: ['registrationFieldsForSelection'],
    queryFn: () => {
      // TODO: 实现注册字段选择列表接口
      return []
    },
    select: (data) => data?.data || []
  })
}

/**
 * 获取激活的注册字段（用于申请表单）
 */
export function useActiveRegistrationFields() {
  return useQuery({
    queryKey: ['registrationFields', 'active'],
    queryFn: () => {
      const { registrationFieldsApi } = require('@/lib/api')
      return registrationFieldsApi.getActiveFields()
    },
    select: (data) => {
      // 处理不同的响应格式
      if (Array.isArray(data?.data)) {
        return data.data
      }
      if (Array.isArray(data)) {
        return data
      }
      return []
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
}

export default {
  usePublicRecruitments,
  usePublicRecruitment,
  useRecruitments,
  useRecruitment,
  useRecruitmentStats,
  useClubsForSelection,
  useRegistrationFieldsForSelection,
  useActiveRegistrationFields,
  useUpdateRecruitmentStatus,
  useDeleteRecruitment,
  useCreateRecruitmentBatch
}