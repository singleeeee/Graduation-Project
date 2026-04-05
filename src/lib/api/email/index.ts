import axiosService from '@/lib/axios';
import type { ApiResponse } from '@/lib/axios';
import type {
  SendEmailRequest,
  SendEmailResponse,
  PreviewRecipientsRequest,
  PreviewRecipientsResponse,
  EmailLog,
  EmailLogDetail,
  EmailLogsResponse,
  EmailTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from './types';

export const emailApi = {
  // ─── 收件人预览 ─────────────────────────────────────────────────
  previewRecipients: async (data: PreviewRecipientsRequest): Promise<PreviewRecipientsResponse> => {
    const res = await axiosService.post<ApiResponse<PreviewRecipientsResponse>>('/email/preview-recipients', data);
    return res.data;
  },

  // ─── 发送邮件 ───────────────────────────────────────────────────
  sendEmail: async (data: SendEmailRequest): Promise<SendEmailResponse> => {
    const res = await axiosService.post<ApiResponse<SendEmailResponse>>('/email/send', data);
    return res.data;
  },

  // ─── 发送记录 ───────────────────────────────────────────────────
  getLogs: async (page = 1, limit = 20): Promise<EmailLogsResponse> => {
    const res = await axiosService.get<ApiResponse<EmailLogsResponse>>('/email/logs', { params: { page, limit } });
    return res.data;
  },

  getLogDetail: async (id: string): Promise<EmailLogDetail> => {
    const res = await axiosService.get<ApiResponse<EmailLogDetail>>(`/email/logs/${id}`);
    return res.data;
  },

  // ─── 模板管理 ───────────────────────────────────────────────────
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const res = await axiosService.get<ApiResponse<EmailTemplate[]>>('/email/templates');
    return res.data;
  },

  getTemplate: async (id: string): Promise<EmailTemplate> => {
    const res = await axiosService.get<ApiResponse<EmailTemplate>>(`/email/templates/${id}`);
    return res.data;
  },

  createTemplate: async (data: CreateTemplateRequest): Promise<EmailTemplate> => {
    const res = await axiosService.post<ApiResponse<EmailTemplate>>('/email/templates', data);
    return res.data;
  },

  updateTemplate: async (id: string, data: UpdateTemplateRequest): Promise<EmailTemplate> => {
    const res = await axiosService.put<ApiResponse<EmailTemplate>>(`/email/templates/${id}`, data);
    return res.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await axiosService.delete(`/email/templates/${id}`);
  },
};
