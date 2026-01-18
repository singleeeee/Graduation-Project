// API 统一导出
export { default as authApi } from './auth'
export { default as usersApi } from './users'
export { default as registrationFieldsApi } from './registration-fields'

// 类型导出
export type {
  LoginRequest,
  RegisterRequest,
  LoginResponse
} from './auth'

export type {
  UserProfile,
  UserRole,
  UserStatus,
  UpdateBasicInfoRequest,
  UpdateProfileFieldsRequest,
  ChangePasswordRequest,
  UserListParams,
  UserListResponse,
  ProfileFieldConfig,
  ProfileFieldsConfigResponse
} from './users'

export type {
  RegistrationField,
  CreateRegistrationFieldRequest,
  UpdateRegistrationFieldRequest,
  RegistrationFieldListResponse
} from './registration-fields'

// 重新导出 axios 服务
export { default as axiosService } from '../axios'
export type { ApiResponse, RefreshTokenResponse } from '../axios'