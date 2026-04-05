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

    const response = await axiosService.get<any>(`/clubs?${queryParams}`)
    
    // 处理API响应，可能是直接Club数组或包装的对象
    const clubsData = response.data || response
    
    if (Array.isArray(clubsData)) {
      // 直接返回俱乐部数组
      return {
        data: clubsData,
        total: clubsData.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(clubsData.length / limit)
      }
    } else {
      // 包装的对象格式
      return {
        data: clubsData.data || [],
        total: clubsData.total || clubsData.pagination?.total || 0,
        page: clubsData.page || page,
        limit: clubsData.limit || limit,
        totalPages: clubsData.totalPages || 1
      }
    }
  }

  // 获取社团详情
  async getClubDetail(clubId: string): Promise<Club> {
    const response = await axiosService.get<ApiResponse<Club>>(`/clubs/${clubId}`)
    return response.data
  }

  // 创建社团
  async createClub(data: CreateClubRequest): Promise<Club> {
    const response = await axiosService.post<ApiResponse<Club>>('/clubs', data)
    return response.data
  }

  // 更新社团信息
  async updateClub(clubId: string, data: UpdateClubRequest): Promise<Club> {
    const response = await axiosService.put<ApiResponse<Club>>(`/clubs/${clubId}`, data)
    return response.data
  }

  // 删除社团（软删除）
  async deleteClub(clubId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosService.delete<ApiResponse<{ success: boolean; message: string }>>(`/clubs/${clubId}`)
    return response.data
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
    })

    // role 为 'all' 时不传，后端只接受 'admin' | 'candidate'
    if (role && role !== 'all') queryParams.append('role', role)
    if (search) queryParams.append('search', search)

    const response = await axiosService.get<any>(`/clubs/${clubId}/members?${queryParams}`)

    // axios 拦截器已剥掉 HTTP 层，response 是 { code, message, data, success }
    // data 字段是后端 getMembers 返回的 { data[], total, page, limit, totalPages }
    const membersData = response?.data ?? response

    if (Array.isArray(membersData)) {
      return {
        data: membersData,
        total: membersData.length,
        page,
        limit,
        totalPages: Math.ceil(membersData.length / limit)
      }
    }

    return {
      data: membersData?.data ?? [],
      total: membersData?.total ?? 0,
      page: membersData?.page ?? page,
      limit: membersData?.limit ?? limit,
      totalPages: membersData?.totalPages ?? 1,
    }
  }

  // 添加成员到社团
  async addMember(clubId: string, data: AddMemberRequest): Promise<ClubMember> {
    const response = await axiosService.post<ApiResponse<ClubMember>>(`/clubs/${clubId}/members`, data)
    return response.data
  }

  // 更新成员角色
  async updateMemberRole(clubId: string, memberId: string, data: UpdateMemberRoleRequest): Promise<ClubMember> {
    const response = await axiosService.put<ApiResponse<ClubMember>>(`/clubs/${clubId}/members/${memberId}`, data)
    return response.data
  }

  // 从社团移除成员
  async removeMember(clubId: string, memberId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosService.delete<ApiResponse<{ success: boolean; message: string }>>(`/clubs/${clubId}/members/${memberId}`)
    return response.data
  }
}

export default new ClubsApi()