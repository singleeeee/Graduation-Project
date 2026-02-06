import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { registrationFieldsApi } from '@/lib/api'
import type { RegistrationField } from '@/lib/api/registration-fields'

/**
 * 获取所有注册字段配置
 */
export function useRegistrationFields() {
  return useQuery({
    queryKey: ['registrationFields'],
    queryFn: () => registrationFieldsApi.getRegistrationFields(),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
}

/**
 * 获取所有激活的注册字段
 */
export function useActiveRegistrationFields() {
  return useQuery({
    queryKey: ['registrationFields', 'active'],
    queryFn: async () => {
      const response = await registrationFieldsApi.getActiveFields()
      return response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
}

/**
 * 创建注册字段mutation
 */
export function useCreateRegistrationField() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => registrationFieldsApi.createRegistrationField(data),
    onSuccess: () => {
      // 创建成功后刷新注册表字段列表
      queryClient.invalidateQueries({ queryKey: ['registrationFields'] })
    },
  })
}

/**
 * 更新注册字段mutation
 */
export function useUpdateRegistrationField() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      registrationFieldsApi.updateRegistrationField(id, data),
    onSuccess: () => {
      // 更新成功后刷新注册表字段列表
      queryClient.invalidateQueries({ queryKey: ['registrationFields'] })
    },
  })
}

/**
 * 删除注册字段mutation
 */
export function useDeleteRegistrationField() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => registrationFieldsApi.deleteRegistrationField(id),
    onSuccess: () => {
      // 删除成功后刷新注册表字段列表
      queryClient.invalidateQueries({ queryKey: ['registrationFields'] })
    },
  })
}