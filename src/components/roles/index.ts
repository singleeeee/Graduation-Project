// 角色管理组件导出
export { RoleSelector } from './RoleSelector'
export { MultiRoleSelector } from './RoleSelector'
export { RoleBadge } from './RoleSelector'
export { PermissionGuard } from './PermissionGuard'
export { ProtectedRoute } from './PermissionGuard'

// 角色管理相关的类型和工具
export type {
  Role,
  RoleDetail,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleListParams,
  PermissionListParams
} from '@/lib/api/roles/types'