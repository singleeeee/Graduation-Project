import axiosService, { type ApiResponse } from '../../axios'
import type {
  UpdateRecruitmentStatusRequest,
  RecruitmentQueryParams,
  RecruitmentListResponse,
  RecruitmentBatch,
  CreateRecruitmentBatchRequest
} from './types'

/**
 * 招新管理 API
 */

// 获取招新列表（需要认证的管理员接口）
export async function getRecruitments(params?: RecruitmentQueryParams): Promise<ApiResponse<RecruitmentListResponse>> {
  const response = await axiosService.get('/recruitment', { params })
  return response
}

// 获取公开的招新列表（候选人可访问）
export async function getPublicRecruitments(params?: RecruitmentQueryParams): Promise<ApiResponse<RecruitmentListResponse>> {
  const response = await axiosService.get('/recruitment/public', { params })
  return response
}

// 获取招新详情（需要认证的管理员接口）
export async function getRecruitment(id: string): Promise<ApiResponse<RecruitmentBatch>> {
  const response = await axiosService.get(`/recruitment/${id}`)
  return response
}



// 更新招新状态（管理员权限）
export async function updateRecruitmentStatus(
  id: string,
  data: UpdateRecruitmentStatusRequest
): Promise<ApiResponse<RecruitmentBatch>> {
  const response = await axiosService.put(`/recruitment/${id}/status`, data)
  return response
}

// 删除招新（管理员权限）
export async function deleteRecruitment(id: string): Promise<ApiResponse<void>> {
  const response = await axiosService.delete(`/recruitment/${id}`)
  return response
}

// 创建招新批次（管理员权限）
export async function createRecruitmentBatch(
  data: CreateRecruitmentBatchRequest
): Promise<ApiResponse<RecruitmentBatch>> {
  const response = await axiosService.post('/recruitment', data)
  return response
}


export default {
  // 管理接口
  getRecruitments,
  getRecruitment,
  updateRecruitmentStatus,
  deleteRecruitment,
  createRecruitmentBatch,
  // 公开接口
  getPublicRecruitments
}