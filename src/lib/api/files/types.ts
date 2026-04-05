/**
 * 文件分类
 */
export type FileCategory = 'resume' | 'avatar' | 'portfolio' | 'certificate' | 'logo' | 'other';

/**
 * 上传文件响应（注意后端有两层 data 嵌套）
 */
export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: string;
  uploadedBy: string;
  createdAt: string;
}

/**
 * 申请关联文件（申请列表/详情中返回的 files[] 条目）
 */
export interface ApplicationFile {
  fileId: string;
  fileType: FileCategory;
  description?: string;
  originalName: string;
  mimeType: string;
  size: number;
  /** 是否支持在线预览（image/* 和 application/pdf） */
  previewable: boolean;
  /** 在线预览 URL（公开，可直接嵌入 iframe 或新标签打开） */
  viewUrl: string;
  /** 下载 URL（需要 Authorization Token） */
  downloadUrl: string;
}

/**
 * 上传请求参数
 */
export interface UploadFileRequest {
  file: File;
  category?: FileCategory;
  description?: string;
}

/**
 * 申请文件关联项（提交申请时使用）
 */
export interface FileLink {
  fileId: string;
  fileType: FileCategory;
  description?: string;
}

/**
 * 文件列表项（我的文件列表）
 */
export interface FileListItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category?: FileCategory;
  description?: string;
  createdAt: string;
}

/**
 * 文件统计
 */
export interface FileStats {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
}
