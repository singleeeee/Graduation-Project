/**
 * 招新管理相关类型定义
 */

// 招新状态枚举
export enum RecruitmentStatus {
  DRAFT = 'draft',          // 草稿
  PUBLISHED = 'published',  // 已发布
  ONGOING = 'ongoing',      // 进行中
  FINISHED = 'finished',    // 已结束
  ARCHIVED = 'archived'     // 已存档
}

// 自定义问题类�?
export interface CustomQuestion {
  id: string
  question: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' // Example types
  required: boolean
  options?: string[] // For select, radio, checkbox types
}

// 招新批次信息接口
export interface RecruitmentBatch {
  id: string
  title: string
  clubId: string
  description: string
  startTime: string // ISO Date string
  endTime: string   // ISO Date string
  maxApplicants: number
  requiredFields: string[] // e.g., ["name", "studentId", "phone"]
  customQuestions: CustomQuestion[]
  status: RecruitmentStatus
  createdAt: string
  updatedAt: string
  adminId: string
  club: {
    id: string
    name: string
    description: string
  }
  applicationCount: number
  _count: {
    applications: number
  }
}



// 创建招新批次请求�?
export interface CreateRecruitmentBatchRequest {
  title: string
  clubId: string
  description: string
  startTime: string // ISO Date string
  endTime: string   // ISO Date string
  maxApplicants: number
  requiredFields: string[] // e.g., ["name", "studentId", "phone"]
  customQuestions: CustomQuestion[]
}


// 更新招新状态请求体
export interface UpdateRecruitmentStatusRequest {
  status: RecruitmentStatus
}

// 招新查询参数
export interface RecruitmentQueryParams {
  page?: number
  limit?: number
  status?: RecruitmentStatus
  clubId?: string
  department?: string
  position?: string
  search?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// 招新列表响应
export interface RecruitmentListResponse {
  data: RecruitmentBatch[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}



