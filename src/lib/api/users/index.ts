import axiosService, { ApiResponse } from '../../axios'
import type {
  UserProfile,
  UserStatus,
  UpdateBasicInfoRequest,
  UpdateProfileFieldsRequest,
  ProfileFieldsConfigResponse,
  ChangePasswordRequest,
  UserListParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest
} from './types'

// 导出类型以供其他模块使用
export type {
  UserProfile,
  UserRole,
  UserStatus,
  UpdateBasicInfoRequest,
  UpdateProfileFieldsRequest,
  ProfileFieldOption,
  ProfileFieldConfig,
  ProfileFieldsConfigResponse,
  ChangePasswordRequest,
  UserListParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest
} from './types'

// 用户 API 类
class UsersApi {
  private axios = axiosService

  /**
   * 处理API响应，支持直接数据格式和包装格式
   */
  private handleResponse<T>(response: any): T {
    // 如果响应是ApiResponse包装格式
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    // 如果响应是直接的数据格式
    return response
  }

  /**
   * 获取当前用户资料
   */
  async getProfile(): Promise<UserProfile> {
    const response = await this.axios.get<UserProfile>('/users/profile')
    return this.handleResponse<UserProfile>(response)
  }

  /**
   * 更新用户基本资料
   */
  async updateBasicInfo(data: UpdateBasicInfoRequest): Promise<UserProfile> {
    const response = await this.axios.put<UserProfile>('/users/profile/basic', data)
    return this.handleResponse<UserProfile>(response)
  }

  /**
   * 更新用户档案字段
   */
  async updateProfileFields(data: UpdateProfileFieldsRequest): Promise<{
    message: string
    updatedFields: string[]
    profileFields: { [key: string]: string }
  }> {
    const response = await this.axios.put<{
      message: string
      updatedFields: string[]
      profileFields: { [key: string]: string }
    }>('/users/profile/fields', data)
    return this.handleResponse<{
      message: string
      updatedFields: string[]
      profileFields: { [key: string]: string }
    }>(response)
  }

  /**
   * 获取用户档案字段配置
   */
  async getProfileFieldsConfig(): Promise<ProfileFieldsConfigResponse> {
    const response = await this.axios.get<ProfileFieldsConfigResponse>('/users/profile/fields-config')
    return this.handleResponse<ProfileFieldsConfigResponse>(response)
  }

  /**
   * 管理员创建用户
   */
  async createUser(data: CreateUserRequest): Promise<UserProfile> {
    const response = await this.axios.post<ApiResponse<UserProfile>>('/api/v1/users', data)
    return this.handleResponse<UserProfile>(response)
  }

  /**
   * 管理员更新用户信息（使用新聚合接口）
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<UserProfile> {
    const response = await this.axios.put<ApiResponse<UserProfile>>(`/api/v1/admin/users/${userId}`, data)
    return this.handleResponse<UserProfile>(response)
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await this.axios.put<{ message: string }>('/users/change-password', data)
    return this.handleResponse<{ message: string }>(response)
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<{ url: string; message: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await this.axios.post<{ url: string; message: string }>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return this.handleResponse<{ url: string; message: string }>(response)
  }

  /**
   * 获取用户列表（需要管理员权限）
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const response = await this.axios.get<any>('/admin/users', {
      params
    })
    
    // 不再使用handleResponse，直接使用原始响应数据
    const apiResponse = response
    
    // 检查API响应是否成功
    if (!apiResponse || !apiResponse.success || apiResponse.code !== 200) {
      console.error('API request failed:', apiResponse?.message || 'Unknown error')
      throw new Error(apiResponse?.message || '获取用户列表失败')
    }
    
    // 提取嵌套的用户数据
    if (apiResponse.data && Array.isArray(apiResponse.data.data)) {
      return {
        users: apiResponse.data.data,
        total: apiResponse.data.pagination?.total || 0,
        page: apiResponse.data.pagination?.page || 1,
        limit: apiResponse.data.pagination?.limit || 10,
        totalPages: apiResponse.data.pagination?.totalPages || 1
      }
    }
    
    // 如果数据结构不符合预期，返回空结果
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  }

  /**
   * 根据ID获取用户详情
   */
  async getUserById(id: string): Promise<UserProfile> {
    const response = await this.axios.get<UserProfile>(`/users/${id}`)
    return this.handleResponse<UserProfile>(response)
  }

  /**
   * 更新用户状态（需要管理员权限）
   */
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<{ message: string }> {
    const response = await this.axios.patch<{ message: string }>(`/users/${id}/status`, { status })
    return this.handleResponse<{ message: string }>(response)
  }

  /**
   * 删除用户（需要管理员权限）
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await this.axios.delete<{ message: string }>(`/users/${id}`)
    return this.handleResponse<{ message: string }>(response)
  }

  /**
   * 获取用户统计数据（需要管理员权限）
   */
  async getUserStats(): Promise<{
    totalUsers: number
    activeUsers: number
    adminCount: number
    candidateCount: number
    interviewerCount: number
    newUsersToday: number
    newUsersThisWeek: number
  }> {
    const response = await this.axios.get<{
      totalUsers: number
      activeUsers: number
      adminCount: number
      candidateCount: number
      interviewerCount: number
      newUsersToday: number
      newUsersThisWeek: number
    }>('/users/stats')
    return this.handleResponse<{
      totalUsers: number
      activeUsers: number
      adminCount: number
      candidateCount: number
      interviewerCount: number
      newUsersToday: number
      newUsersThisWeek: number
    }>(response)
  }


}

// 创建单例
const usersApi = new UsersApi()

export default usersApi