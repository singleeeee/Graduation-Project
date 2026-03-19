import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/lib/api/files';
import type { UploadFileRequest } from '@/lib/api/files/types';

/**
 * 获取当前用户的文件列表
 */
export function useMyFiles() {
  return useQuery({
    queryKey: ['myFiles'],
    queryFn: () => filesApi.getMyFiles(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * 文件统计
 */
export function useFileStats() {
  return useQuery({
    queryKey: ['fileStats'],
    queryFn: () => filesApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 上传文件 Mutation
 * 上传成功后自动刷新 myFiles 列表
 */
export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UploadFileRequest) => filesApi.upload(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFiles'] });
      queryClient.invalidateQueries({ queryKey: ['fileStats'] });
    },
  });
}

/**
 * 删除文件 Mutation
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFiles'] });
      queryClient.invalidateQueries({ queryKey: ['fileStats'] });
    },
  });
}
