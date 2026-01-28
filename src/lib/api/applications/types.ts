export type ApplicationStatus = 
  | 'draft'        // 草稿
  | 'submitted'    // 已提交
  | 'screening'    // 筛选中
  | 'passed'       // 通过筛选
  | 'rejected'     // 未通过
  | 'interview_scheduled'  // 已安排面试
  | 'interview_completed'  // 面试完成
  | 'offer_sent'   // 已发offer
  | 'accepted'     // 已接受
  | 'declined'     // 已拒绝
  | 'archived';    // 已归档

/**
 * 申请记录基础类型
 */
export interface Application {
  id: string;
  recruitmentId: string;
  applicantId: string;
  status: ApplicationStatus;
  resumeText?: string;
  education?: {
    name: string;
    grade?: string;
    major?: string;
    phone: string;
    college?: string;
    studentId?: string;
    experience?: string;
    motivation?: string;
    [key: string]: any;
  };
  formData?: Record<string, any>;
  skills?: any;
  experiences?: any;
  attachments?: any;
  aiScore?: number;
  aiAnalysis?: any;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

/**
 * 申请列表项（包含扩展信息）
 */
export interface ApplicationListItem extends Application {
  recruitment?: {
    id: string;
    title: string;
    club: {
      id: string;
      name: string;
      description?: string;
    };
  };
  applicant?: {
    id: string;
    name: string;
    email: string;
    studentId?: string;
  };
}

/**
 * 申请详情
 */
export interface ApplicationDetail extends Application {
  recruitment: {
    id: string;
    title: string;
    description: string;
    club: {
      id: string;
      name: string;
      description?: string;
    };
  };
  applicant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    studentId?: string;
    college?: string;
    major?: string;
  };
  statusHistory: StatusHistoryItem[];
  interviews?: Array<{
    id: string;
    scheduledTime: string;
    status: string;
    interviewer?: {
      name: string;
    };
  }>;
}

/**
 * 状态历史记录
 */
export interface StatusHistoryItem {
  id: string;
  status: ApplicationStatus;
  comment?: string;
  changedBy: {
    id: string;
    name: string;
    role: string;
  };
  changedAt: string;
}

/**
 * 创建申请请求
 */
export interface CreateApplicationRequest {
  recruitmentId: string;
  resumeText?: string;
  formData: {
    name: string;
    studentId: string;
    phone: string;
    college?: string;
    major?: string;
    experience?: string;
    motivation?: string;
    [key: string]: any; // 其他动态字段
  };
}

/**
 * 更新申请状态请求
 */
export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  comment?: string;
}

/**
 * 获取申请列表查询参数
 */
export interface ApplicationQueryParams {
  status?: ApplicationStatus;
  recruitmentId?: string;
  applicantId?: string;
  page?: number;
  limit?: number;
}

/**
 * 申请列表响应
 */
export interface ApplicationListResponse {
  data: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * 我的申请查询参数
 */
export interface MyApplicationsQueryParams {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

/**
 * 我的申请响应
 */
export interface MyApplicationsResponse {
  data: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}