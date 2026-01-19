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