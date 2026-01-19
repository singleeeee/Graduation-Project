import axiosService, { ApiResponse } from '../../axios'
import type {
  UserProfile,
  UserStatus,
  UpdateBasicInfoRequest,
  UpdateProfileFieldsRequest,
  ProfileFieldsConfigResponse,
  ChangePasswordRequest,
  UserListParams,
  UserListResponse
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
  UserListResponse
} from './types'

// 用户 API 类
class UsersApi {
  private axios = axiosService

  /**
   * 获取当前用户资料
   */
  async getProfile(): Promise<UserProfile> {
    const response = await this.axios.get<UserProfile>('/users/profile')
    return response.data
  }

  /**
   * 更新用户基本资料
   */
  async updateBasicInfo(data: UpdateBasicInfoRequest): Promise<UserProfile> {
    const response = await this.axios.put<UserProfile>('/users/profile/basic', data)
    return response.data
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
    return response.data
  }

  /**
   * 获取用户档案字段配置
   */
  async getProfileFieldsConfig(): Promise<ProfileFieldsConfigResponse> {
    const response = await this.axios.get<ProfileFieldsConfigResponse>('/users/profile/fields-config')
    return response.data
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await this.axios.put<{ message: string }>('/users/change-password', data)
    return response.data
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
    return response.data
  }

  /**
   * 获取用户列表（需要管理员权限）
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const result = await this.axios.get<ApiResponse<UserListResponse>>('/admin/users', {
      params
    })
    return result.data.data
  }

  /**
   * 根据ID获取用户详情
   */
  async getUserById(id: string): Promise<UserProfile> {
    const response = await this.axios.get<UserProfile>(`/users/${id}`)
    return response.data
  }

  /**
   * 更新用户状态（需要管理员权限）
   */
  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<{ message: string }> {
    const response = await this.axios.patch<{ message: string }>(`/users/${id}/status`, { status })
    return response.data
  }

  /**
   * 删除用户（需要管理员权限）
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await this.axios.delete<{ message: string }>(`/users/${id}`)
    return response.data
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
    return response.data
  }

  /**
   * 批量导入用户（需要管理员权限）
   */
  async importUsers(file: File): Promise<{
    imported: number
    failed: number
    errors: string[]
    message: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await this.axios.post<{
      imported: number
      failed: number
      errors: string[]
      message: string
    }>('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 导出用户数据（需要管理员权限）
   */
  async exportUsers(filters?: {
    role?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<Blob> {
    const response = await this.axios.get('/users/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data as Blob
  }
}

// 创建单例
const usersApi = new UsersApi()

export default usersApi