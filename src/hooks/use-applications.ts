import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api'
import type { 
  ApplicationQueryParams, 
  MyApplicationsQueryParams,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  Application,
  ApplicationDetail 
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