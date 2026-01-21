// 角色基本信息
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  level: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 权限基本信息
export interface Permission {
  id: string
  name: string
  code: string
  module: string
  description?: string
  createdAt: string
}

// 角色权限关联信息
export interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  createdAt: string
  permission: Permission
}

// 角色的完整信息（包含权限）
export interface RoleDetail extends Role {
  permissions: RolePermission[]
}

// 创建角色请求
export interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  level?: number
  isActive?: boolean
}

// 更新角色请求
export interface UpdateRoleRequest {
  name?: string
  description?: string
  level?: number
  isActive?: boolean
}

// 分配权限给角色
export interface AssignPermissionsRequest {
  permissionIds: string[]
}

// 添加权限请求
export interface AddPermissionsRequest {
  permissionIds: string[]
}

// 移除权限请求
export interface RemovePermissionsRequest {
  permissionIds: string[]
}

// 角色列表查询参数
export interface RoleListParams {
  page?: number
  limit?: number
  search?: string
  level?: number
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 角色列表响应
export interface RoleListResponse {
  roles: Role[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 权限列表查询参数
export interface PermissionListParams {
  page?: number
  limit?: number
  module?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 权限列表响应
export interface PermissionListResponse {
  permissions: Permission[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 检查角色权限响应
export interface HasPermissionResponse {
  hasPermission: boolean
}

// 角色权限代码列表
export interface RolePermissionCodesResponse {
  codes: string[]
}