// 社团信息接口
export interface Club {
  id: string
  name: string
  description: string
  logo?: string
  category: string
  isActive: boolean
  adminCount: number
  recruitmentCount: number
  candidateCount: number
  createdAt: string
  updatedAt: string
  _count?: {
    admins: number
    recruitments: number
  }
}

// 社团成员信息
export interface ClubMember {
  id: string
  userId: string
  clubId: string
  role: 'admin' | 'candidate'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

// 创建社团请求
export interface CreateClubRequest {
  name: string
  description: string
  category: string
  logo?: string
}

// 更新社团请求
export interface UpdateClubRequest {
  name?: string
  description?: string
  category?: string
  logo?: string
  isActive?: boolean
}

// 社团列表查询参数
export interface ClubListParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  isActive?: boolean
}

// 社团列表响应
export interface ClubListResponse {
  data: Club[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 后端返回的社团列表数据结构
export interface BackendClubListResponse {
  data: Club[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 后端返回的社团成员列表数据结构
export interface BackendClubMembersResponse {
  data: ClubMember[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 社团成员列表查询参数
export interface ClubMembersParams {
  page?: number
  limit?: number
  role?: 'admin' | 'candidate' | 'all'
  search?: string
}

// 社团成员列表响应
export interface ClubMembersResponse {
  data: ClubMember[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 添加成员到社团请求
export interface AddMemberRequest {
  userId: string
  role: 'admin' | 'candidate'
}

// 更新成员角色请求
export interface UpdateMemberRoleRequest {
  role: 'admin' | 'candidate'
}