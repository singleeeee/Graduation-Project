import axiosService, { ApiResponse } from '../axios'

// 用户资料接口（从 auth 导入以避免循环依赖）
export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  studentId?: string
  major?: string
  grade?: string
  role: 'admin' | 'candidate' | 'interviewer'
  avatar?: string
  createdAt: string
  updatedAt: string
}

// 更新用户资料请求
export interface UpdateProfileRequest {
  name?: string
  phone?: string
  major?: string
  grade?: string
  avatar?: string
}

// 修改密码请求
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// 用户列表查询参数
export interface UserListParams {
  page?: number
  limit?: number
  role?: 'admin' | 'candidate' | 'interviewer'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 用户列表响应
export interface UserListResponse {
  users: UserProfile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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
   * 更新当前用户资料
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await this.axios.put<UserProfile>('/users/profile', data)
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
    const response = await this.axios.get<UserListResponse>('/users', {
      params
    })
    return response.data
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