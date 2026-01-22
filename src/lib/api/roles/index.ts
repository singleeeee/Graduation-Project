import axiosService from '@/lib/axios'
import type {
  ApiResponse
} from '@/lib/axios'
import type {
  Role,
  RoleDetail,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  AddPermissionsRequest,
  RemovePermissionsRequest,
  RoleListParams,
  RoleListResponse,
  PermissionListParams,
  PermissionListResponse,
  HasPermissionResponse,
  RolePermissionCodesResponse
} from './types'

const ROLES_BASE_URL = '/roles'
const PERMISSIONS_BASE_URL = '/permissions'

/**
 * 角色管理API
 */
const rolesApi = {
  // 获取角色列表
  getRoles: (params?: RoleListParams) => {
    return axiosService.get<Role[]>(
      ROLES_BASE_URL,
      { params }
    )
  },

  // 获取角色详情
  getRole: (id: string) => {
    return axiosService.get<ApiResponse<RoleDetail>>(
      `${ROLES_BASE_URL}/${id}`
    )
  },

  // 根据角色代码获取角色
  getRoleByCode: (code: string) => {
    return axiosService.get<ApiResponse<Role>>(
      `${ROLES_BASE_URL}/code/${code}`
    )
  },

  // 创建角色
  createRole: (data: CreateRoleRequest) => {
    return axiosService.post<ApiResponse<Role>>(
      ROLES_BASE_URL,
      data
    )
  },

  // 更新角色
  updateRole: (id: string, data: UpdateRoleRequest) => {
    return axiosService.put<ApiResponse<Role>>(
      `${ROLES_BASE_URL}/${id}`,
      data
    )
  },

  // 删除角色
  deleteRole: (id: string) => {
    return axiosService.delete<ApiResponse<void>>(
      `${ROLES_BASE_URL}/${id}`
    )
  },

  // 分配权限给角色
  assignPermissions: (roleId: string, data: AssignPermissionsRequest) => {
    return axiosService.post<ApiResponse<void>>(
      `${ROLES_BASE_URL}/${roleId}/permissions`,
      data
    )
  },

  // 添加权限到角色
  addPermissions: (roleId: string, data: AddPermissionsRequest) => {
    return axiosService.post<ApiResponse<void>>(
      `${ROLES_BASE_URL}/${roleId}/permissions/add`,
      data
    )
  },

  // 从角色移除权限
  removePermissions: (roleId: string, data: RemovePermissionsRequest) => {
    return axiosService.delete<ApiResponse<void>>(
      `${ROLES_BASE_URL}/${roleId}/permissions/remove`,
      { data }
    )
  },

  // 获取角色权限列表
  getRolePermissions: (roleId: string) => {
    return axiosService.get<RolePermissionCodesResponse>(
      `${ROLES_BASE_URL}/${roleId}/permissions`
    )
  },

  // 检查角色是否具有指定权限
  checkRolePermission: (roleId: string, permissionCode: string) => {
    return axiosService.get<ApiResponse<HasPermissionResponse>>(
      `${ROLES_BASE_URL}/${roleId}/has-permission/${permissionCode}`
    )
  }
}

/**
 * 权限管理API
 */
const permissionsApi = {
  // 获取权限列表
  getPermissions: (params?: PermissionListParams) => {
    return axiosService.get<Permission[]>(
      PERMISSIONS_BASE_URL,
      { params }
    )
  },

  // 获取权限详情
  getPermission: (id: string) => {
    return axiosService.get<ApiResponse<Permission>>(
      `${PERMISSIONS_BASE_URL}/${id}`
    )
  },

  // 根据权限代码获取权限
  getPermissionByCode: (code: string) => {
    return axiosService.get<ApiResponse<Permission>>(
      `${PERMISSIONS_BASE_URL}/code/${code}`
    )
  },

  // 获取所有权限模块
  getPermissionModules: () => {
    return axiosService.get<string[]>(
      `${PERMISSIONS_BASE_URL}/modules`
    )
  }
}

export { rolesApi, permissionsApi }
export default { rolesApi, permissionsApi }