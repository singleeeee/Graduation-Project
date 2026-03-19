import axiosService from '@/lib/axios';
import type { ApiResponse } from '@/lib/axios';
import type {
  Application,
  ApplicationDetail,
  ApplicationListItem,
  ApplicationListResponse,
  MyApplicationsResponse,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
  ApplicationQueryParams,
  MyApplicationsQueryParams,
  DashboardResponse
} from './types';

/**
 * 申请相关的API接口
 */
export const applicationsApi = {
  /**
   * 获取申请列表
   * GET /api/v1/applications
   */
  getApplications: async (params?: ApplicationQueryParams): Promise<ApplicationListResponse> => {
    const response = await axiosService.get<ApiResponse<ApplicationListResponse>>('/applications', {
      params
    });
    return response.data;
  },

  /**
   * 获取我的申请
   * GET /api/v1/applications/my
   */
  getMyApplications: async (params?: MyApplicationsQueryParams): Promise<MyApplicationsResponse> => {
    const response = await axiosService.get<ApiResponse<ApplicationListItem[]>>('/applications/my', {
      params
    });
    return {
      data: response.data,
      pagination: {
        page: 1,
        limit: response.data.length,
        total: response.data.length,
        pages: 1
      }
    };
  },

  /**
   * 获取申请详情
   * GET /api/v1/applications/{id}
   */
  getApplication: async (id: string): Promise<ApplicationDetail> => {
    const response = await axiosService.get<ApiResponse<ApplicationDetail>>(`/applications/${id}`);
    return response.data;
  },

  /**
   * 提交申请
   * POST /api/v1/applications
   */
  createApplication: async (data: CreateApplicationRequest): Promise<Application> => {
    const response = await axiosService.post<ApiResponse<Application>>('/applications', data);
    return response.data;
  },

  /**
   * 更新申请状态
   * PUT /api/v1/applications/{id}/status
   */
  updateApplicationStatus: async (
    id: string, 
    data: UpdateApplicationStatusRequest
  ): Promise<Application> => {
    const response = await axiosService.put<ApiResponse<Application>>(
      `/applications/${id}/status`, 
      data
    );
    return response.data;
  },

  /**
   * 删除申请
   * DELETE /api/v1/applications/{id}
   */
  deleteApplication: async (id: string): Promise<void> => {
    await axiosService.delete<ApiResponse<void>>(`/applications/${id}`);
  },

  /**
   * 获取仪表盘统计数据
   * GET /api/v1/applications/dashboard
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await axiosService.get<ApiResponse<DashboardResponse>>('/applications/dashboard');
    return response.data;
  }
};
