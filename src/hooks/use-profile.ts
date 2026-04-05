import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { usersApi } from "@/lib/api";
import type {
  UserProfile,
  ProfileFieldsConfigResponse,
  UpdateBasicInfoRequest,
  UpdateProfileFieldsRequest,
} from "@/lib/api/users/types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => usersApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProfileFieldsConfig() {
  return useQuery({
    queryKey: ["profile-fields-config"],
    queryFn: () => usersApi.getProfileFieldsConfig(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateBasicInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBasicInfoRequest) =>
      usersApi.updateBasicInfo(data),
    onSuccess: (updatedProfile) => {
      // Update the profile cache with the updated data
      queryClient.setQueryData(["profile"], updatedProfile);

      toast({
        title: "更新成功",
        description: "基本信息已更新",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "更新失败",
        description: error.message || "更新基本信息时出现错误",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProfileFields() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateProfileFieldsRequest) => usersApi.updateProfileFields(data),
    onSuccess: (response) => {
      // 不更新缓存中的profile数据，避免触发useEffect钩子重新初始化表单值
      
      toast({
        title: '更新成功',
        description: '档案字段已更新',
        variant: 'default',
      })
    },
    onError: (error: any) => {
      toast({
        title: '更新失败',
        description: error?.message || '更新档案字段时出现错误',
        variant: 'destructive',
      })
    },
  })
}
