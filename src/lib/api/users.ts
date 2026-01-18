import axiosService, { ApiResponse } from '../axios'

// 用户角色信息
export interface UserRole {
  id: string
  name: string
  code: 'admin' | 'candidate' | 'interviewer'
}

// 用户状态
export type UserStatus = 'active' | 'inactive' | 'suspended'

// 用户资料接口（从 auth 导入以避免循环依赖）
export interface UserProfile {
  id: string
  name: string
  email: string
  status: UserStatus
  avatar?: string
  role: UserRole | string // 后端可能返回对象或字符串角色
  // 常用动态字段
  studentId?: string
  college?: string
  major?: string
  grade?: string
  phone?: string
  experience?: string
  motivation?: string
  // 完整档案字段映射
  profileFields?: { [key: string]: string }
  createdAt: string
  updatedAt: string
}

// 更新用户基本资料请求
export interface UpdateBasicInfoRequest {
  name?: string
  avatar?: string
}

// 更新用户档案字段请求
export interface UpdateProfileFieldsRequest {
  profileFields: { [key: string]: string }
}

// 档案字段选项
export interface ProfileFieldOption {
  label: string
  value: string
}

// 档案字段配置
export interface ProfileFieldConfig {
  id: string
  fieldName: string
  fieldLabel: string
  fieldType: 'text' | 'email' | 'select' | 'textarea' | 'file' | 'date' | 'number'
  isRequired: boolean
  placeholder?: string
  helpText?: string
  options?: {
    options: ProfileFieldOption[]
  }
  validationRules?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    custom?: any
  }
  currentValue: string
  fileId?: string | null
}

// 档案字段配置响应
export interface ProfileFieldsConfigResponse {
  fields: ProfileFieldConfig[]
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
    const response = await this.axios.get<UserListResponse>('/admin/users', {
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