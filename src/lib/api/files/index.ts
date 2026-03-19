import axiosService from '@/lib/axios';
import type { ApiResponse } from '@/lib/axios';
import type {
  UploadedFile,
  FileListItem,
  FileStats,
  UploadFileRequest,
} from './types';

/**
 * 文件相关 API
 * 路由前缀：/files
 */
export const filesApi = {
  /**
   * 上传文件
   * POST /files/upload
   * Content-Type: multipart/form-data
   *
   * ⚠️ 注意：后端响应有两层 data 嵌套：response.data.data.id 才是 fileId
   */
  upload: async (params: UploadFileRequest): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.category) formData.append('category', params.category);
    if (params.description) formData.append('description', params.description);

    // 响应结构: { data: { data: UploadedFile, message: string } }
    const res = await axiosService.post<ApiResponse<{ data: UploadedFile; message: string }>>(
      '/files/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    // 兼容两层 data 嵌套
    const inner = (res as any).data ?? res;
    return inner.data ?? inner;
  },

  /**
   * 获取在线预览 URL（公开，无需 Token）
   * GET /files/:id/view
   * 支持 image/jpeg、image/png、image/gif、application/pdf
   */
  getViewUrl: (fileId: string): string => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    return `${base}/files/${fileId}/view`;
  },

  /**
   * 获取下载 URL（需要 Authorization Token）
   * GET /files/:id
   */
  getDownloadUrl: (fileId: string): string => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    return `${base}/files/${fileId}`;
  },

  /**
   * 带鉴权下载文件（触发浏览器下载）
   */
  download: async (fileId: string, filename?: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${base}/files/${fileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('下载失败');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 获取当前用户上传的文件列表
   * GET /files
   */
  getMyFiles: async (): Promise<FileListItem[]> => {
    const res = await axiosService.get<ApiResponse<FileListItem[]>>('/files');
    return (res as any).data ?? res;
  },

  /**
   * 删除文件（仅文件上传者可操作）
   * DELETE /files/:id
   */
  deleteFile: async (fileId: string): Promise<void> => {
    await axiosService.delete(`/files/${fileId}`);
  },

  /**
   * 文件使用统计
   * GET /files/stats/summary
   */
  getStats: async (): Promise<FileStats> => {
    const res = await axiosService.get<ApiResponse<FileStats>>('/files/stats/summary');
    return (res as any).data ?? res;
  },

  /**
   * 判断 mimeType 是否支持在线预览
   */
  isPreviewable: (mimeType: string): boolean => {
    return ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(mimeType);
  },

  /**
   * 格式化文件大小
   */
  formatSize: (bytes: number | string): string => {
    const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(n)) return '-';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  },
};
