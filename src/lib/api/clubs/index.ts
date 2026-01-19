import axiosService, { ApiResponse } from '../../axios'
import type {
  Club,
  ClubMember,
  CreateClubRequest,
  UpdateClubRequest,
  ClubListParams,
  ClubListResponse,
  ClubMembersParams,
  ClubMembersResponse,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  BackendClubListResponse,
  BackendClubMembersResponse
} from './types'

// 导出类型以供其他模块使用
export type {
  Club,
  ClubMember,
  CreateClubRequest,
  UpdateClubRequest,
  ClubListParams,
  ClubListResponse,
  ClubMembersParams,
  ClubMembersResponse,
  AddMemberRequest,
  UpdateMemberRoleRequest
} from './types'

class ClubsApi {
  // 获取社团列表
  async getClubs(params: ClubListParams = {}): Promise<ClubListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search) queryParams.append('search', search)
    if (category) queryParams.append('category', category)
    if (typeof isActive === 'boolean') queryParams.append('isActive', isActive.toString())

    const response = await axiosService.get<BackendClubListResponse>(`/clubs?${queryParams}`)
    
    // 转换后端响应格式为前端期望的格式
    const backendData = response.data
    return {
      data: backendData.data,
      total: backendData.pagination.total,
      page: backendData.pagination.page,
      limit: backendData.pagination.limit,
      totalPages: backendData.pagination.totalPages
    }
  }

  // 获取社团详情
  async getClubDetail(clubId: string): Promise<Club> {
    const response = await axiosService.get<ApiResponse<Club>>(`/clubs/${clubId}`)
    return response.data.data
  }

  // 创建社团
  async createClub(data: CreateClubRequest): Promise<Club> {
    const response = await axiosService.post<ApiResponse<Club>>('/clubs', data)
    return response.data.data
  }

  // 更新社团信息
  async updateClub(clubId: string, data: UpdateClubRequest): Promise<Club> {
    const response = await axiosService.put<ApiResponse<Club>>(`/clubs/${clubId}`, data)
    return response.data.data
  }

  // 删除社团（软删除）
  async deleteClub(clubId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosService.delete<ApiResponse<{ success: boolean; message: string }>>(`/clubs/${clubId}`)
    return response.data.data
  }

  // 获取社团成员列表
  async getClubMembers(clubId: string, params: ClubMembersParams = {}): Promise<ClubMembersResponse> {
    const {
      page = 1,
      limit = 10,
      role = 'all',
      search
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      role
    })

    if (search) queryParams.append('search', search)

    const response = await axiosService.get<ApiResponse<BackendClubMembersResponse>>(`/clubs/${clubId}/members?${queryParams}`)
    
    // 转换后端响应格式为前端期望的格式
    const backendData = response.data.data
    console.log(backendData, response, '@')
    return {
      data: backendData.data,
      total: backendData.pagination.total,
      page: backendData.pagination.page,
      limit: backendData.pagination.limit,
      totalPages: backendData.pagination.totalPages
    }
  }

  // 添加成员到社团
  async addMember(clubId: string, data: AddMemberRequest): Promise<ClubMember> {
    const response = await axiosService.post<ApiResponse<ClubMember>>(`/clubs/${clubId}/members`, data)
    return response.data.data
  }

  // 更新成员角色
  async updateMemberRole(clubId: string, memberId: string, data: UpdateMemberRoleRequest): Promise<ClubMember> {
    const response = await axiosService.put<ApiResponse<ClubMember>>(`/clubs/${clubId}/members/${memberId}`, data)
    return response.data.data
  }

  // 从社团移除成员
  async removeMember(clubId: string, memberId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosService.delete<ApiResponse<{ success: boolean; message: string }>>(`/clubs/${clubId}/members/${memberId}`)
    return response.data.data
  }
}

export default new ClubsApi()