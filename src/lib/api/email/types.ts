// ─── 收件人筛选类型 ───────────────────────────────────────────────
export type RecipientFilterType =
  | 'all'
  | 'specific'
  | 'by_status'
  | 'by_recruitment'
  | 'by_club';

export interface FilterParams {
  emails?: string[];
  status?: string;
  recruitmentId?: string;
  clubId?: string;
}

// ─── 发送邮件 ─────────────────────────────────────────────────────
export interface SendEmailRequest {
  subject: string;
  body: string;
  senderName: string;
  filterType: RecipientFilterType;
  filterParams?: FilterParams;
  templateId?: string;
}

export interface SendEmailResponse {
  logId: string;
  recipientCount: number;
}

// ─── 收件人预览 ───────────────────────────────────────────────────
export interface PreviewRecipientsRequest {
  filterType: RecipientFilterType;
  filterParams?: FilterParams;
}

export interface PreviewRecipientsResponse {
  count: number;
  preview: Array<{ email: string; name: string | null }>;
  hasMore: boolean;
}

// ─── 发送记录 ─────────────────────────────────────────────────────
export interface EmailLog {
  id: string;
  subject: string;
  senderEmail: string;
  senderName: string;
  recipientCount: number;
  successCount: number;
  failCount: number;
  status: 'pending' | 'sending' | 'done' | 'failed';
  filterType: RecipientFilterType;
  filterParams: FilterParams | null;
  sentBy: string;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: { name: string | null; email: string };
  template?: { name: string } | null;
}

export interface EmailLogDetail extends EmailLog {
  body: string;
  recipients: Array<{
    id: string;
    email: string;
    name: string | null;
    status: 'pending' | 'sent' | 'failed';
    error: string | null;
    sentAt: string | null;
  }>;
}

export interface EmailLogsResponse {
  total: number;
  page: number;
  limit: number;
  data: EmailLog[];
}

// ─── 邮件模板 ─────────────────────────────────────────────────────
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string | null;
  variables: string[] | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { name: string | null };
}

export interface CreateTemplateRequest {
  name: string;
  subject: string;
  body: string;
  description?: string;
  variables?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  body?: string;
  description?: string;
  variables?: string[];
}
