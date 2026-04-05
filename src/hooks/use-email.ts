import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailApi } from "@/lib/api/email";
import type {
  SendEmailRequest,
  PreviewRecipientsRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from "@/lib/api/email/types";

// ─── 邮件模板 ────────────────────────────────────────────────────────────────

export function useEmailTemplates() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: () => emailApi.getTemplates(),
    staleTime: 2 * 60 * 1000,
  });

  return {
    templates: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => emailApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      emailApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
    },
  });
}

// ─── 发送记录 ────────────────────────────────────────────────────────────────

export function useEmailLogs(page = 1, limit = 20) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["emailLogs", page, limit],
    queryFn: () => emailApi.getLogs(page, limit),
    staleTime: 30 * 1000,
  });

  return {
    logs: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? limit,
    isLoading,
    error,
    refetch,
  };
}

export function useEmailLogDetail(id: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["emailLogDetail", id],
    queryFn: () => emailApi.getLogDetail(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });

  return { log: data, isLoading, error };
}

// ─── 收件人预览 ──────────────────────────────────────────────────────────────

export function usePreviewRecipients() {
  return useMutation({
    mutationFn: (data: PreviewRecipientsRequest) =>
      emailApi.previewRecipients(data),
  });
}

// ─── 发送邮件 ────────────────────────────────────────────────────────────────

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendEmailRequest) => emailApi.sendEmail(data),
    onSuccess: () => {
      // 发送成功后刷新发送记录
      queryClient.invalidateQueries({ queryKey: ["emailLogs"] });
    },
  });
}
