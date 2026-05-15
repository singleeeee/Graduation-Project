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
    
    console.log('[getClubs] params:', { page, limit, search, category, isActive })
    console.log('[getClubs] raw response:', response)
    console.log('[getClubs] response type:', Array.isArray(response) ? 'array' : typeof response)
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      console.log('[getClubs] response keys:', Object.keys(response))
      console.log('[getClubs] response.data:', response.data)
    }

    // axios 拦截器已剥掉 HTTP 层（return response.data），
    // 所以 response 可能是：
    //   1. { code, message, data: Club[], success } —— 标准包装格式
    //   2. { code, message, data: { data: Club[], total, ... }, success } —— 分页包装格式
    //   3. Club[] —— 后端直接返回数组（无包装）
    let rawData: any
    if (Array.isArray(response)) {
      // 情况 3：直接数组
      rawData = response
    } else if (response && typeof response === 'object') {
      // 情况 1 / 2：标准包装，取 .data 字段
      rawData = response.data ?? response
    } else {
      rawData = response
    }

    // 客户端兜底过滤（后端可能未处理这些查询参数）
    const applyFilters = (list: any[]): any[] => {
      let result = list
      if (search) {
        const s = search.toLowerCase()
        result = result.filter((c) => c.name?.toLowerCase().includes(s))
      }
      if (category) {
        result = result.filter((c) => c.category === category)
      }
      if (typeof isActive === 'boolean') {
        result = result.filter((c) => c.isActive === isActive)
      }
      return result
    }

    if (Array.isArray(rawData)) {
      // rawData 是 Club 数组
      const filtered = applyFilters(rawData)
      return {
        data: filtered,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1
      }
    } else {
      // rawData 是分页对象 { data: Club[], total, page, limit, totalPages }
      const list = Array.isArray(rawData?.data) ? applyFilters(rawData.data) : []
      return {
        data: list,
        total: rawData?.total ?? rawData?.pagination?.total ?? list.length,
        page: rawData?.page ?? page,
        limit: rawData?.limit ?? limit,
        totalPages: rawData?.totalPages ?? (Math.ceil(list.length / limit) || 1)
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