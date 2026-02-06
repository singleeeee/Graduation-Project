"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useRecruitment,
  useClubsForSelection,
  useRegistrationFieldsForSelection,
} from "@/hooks/use-recruitment";
import type {
  CreateRecruitmentBatchRequest,
  Club,
  RegistrationField,
} from "@/lib/api";
import { recruitmentApi } from "@/lib/api";
import { toast } from "sonner";

// Zod schema for form validation - same as creation but maybe we add id or other edit specific validations if needed
const updateBatchSchema = z.object({
  title: z.string().min(1, "标题是必填项"),
  clubId: z.string().min(1, "社团ID是必填项"),
  description: z.string().min(1, "描述是必填项"),
  startTime: z.string().min(1, "开始时间是必填项"),
  endTime: z.string().min(1, "结束时间是必填项"),
  maxApplicants: z.number().int().positive("最大申请人数必须是正整数"),
  requiredFields: z.array(z.string()).optional(),
  customQuestions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        type: z.string(),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export default function EditRecruitmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  // Fetch the existing recruitment batch data to pre-fill the form
  const { data: recruitment, isLoading } = useRecruitment(id);
  // Hooks for dropdowns
  const { data: clubs = [], isLoading: isClubsLoading } =
    useClubsForSelection();
  const { data: registrationFields = [], isLoading: isFieldsLoading } =
    useRegistrationFieldsForSelection();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<CreateRecruitmentBatchRequest>({
    resolver: zodResolver(updateBatchSchema),
    defaultValues: {
      title: "",
      clubId: "",
      description: "",
      startTime: "",
      endTime: "",
      maxApplicants: 0,
      requiredFields: [],
      customQuestions: [],
    },
  });

  // Pre-fill form when recruitment data is loaded
  React.useEffect(() => {
    if (recruitment) {
      reset({
        title: recruitment.title || "",
        clubId: recruitment.clubId || "",
        description: recruitment.description || "",
        startTime: recruitment.startTime
          ? new Date(recruitment.startTime).toISOString().slice(0, 16)
          : "",
        endTime: recruitment.endTime
          ? new Date(recruitment.endTime).toISOString().slice(0, 16)
          : "",
        maxApplicants: recruitment.maxApplicants || 0,
        requiredFields: recruitment.requiredFields || [],
        customQuestions: recruitment.customQuestions || [],
      });
    }
  }, [recruitment, reset]);

  const watchedRequiredFields = watch("requiredFields") || [];

  const handleFieldCheckboxChange = (fieldName: string, checked: boolean) => {
    const currentFields = getValues("requiredFields") || [];
    let updatedFields: string[];

    if (checked) {
      updatedFields = [...currentFields, fieldName];
    } else {
      updatedFields = currentFields.filter((f) => f !== fieldName);
    }
    setValue("requiredFields", updatedFields);
  };

  // 实现实际的更新批次的 API 调用
  const onSubmit = async (data: CreateRecruitmentBatchRequest) => {
    console.log("Form submission data for update:", data);
    const processedData: CreateRecruitmentBatchRequest = {
      ...data,
      requiredFields: data.requiredFields || [],
      customQuestions: [], // Placeholder - will be implemented in future iterations
    };
    console.log("Processed data for API update:", processedData);

    try {
      // 调用实际的 API 更新招新批次
      const response = await recruitmentApi.updateRecruitmentBatch(
        id,
        processedData,
      );

      if (response && response.success) {
        toast.success("招新批次更新成功！");
        // 刷新相关的查询缓存，确保详情页显示最新的数据
        queryClient.invalidateQueries({ queryKey: ["recruitment", id] });
        queryClient.invalidateQueries({ queryKey: ["recruitments"] });
        router.push(`/admin/recruitment/${id}`); // Redirect back to the detail page
      } else if (response) {
        throw new Error(response.message || "更新失败");
      } else {
        throw new Error("服务器响应异常");
      }
    } catch (error) {
      console.error("更新招新批次失败:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      toast.error(`更新招新批次失败: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!recruitment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">招新不存在</p>
          <button
            onClick={() => router.back()}
            className="mt-2 text-blue-600 hover:underline"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            编辑招新批次
          </h1>
          <p className="mt-2 text-gray-600">编辑"{recruitment.title}"信息</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">批次标题</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="clubId">选择社团</Label>
              {isClubsLoading ? (
                <p>加载社团列表中...</p>
              ) : (
                <Select
                  value={getValues("clubId")}
                  onValueChange={(value) => setValue("clubId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择社团" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club: Club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.clubId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.clubId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">开始时间</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="endTime">结束时间</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="maxApplicants">最大申请人数</Label>
              <Input
                id="maxApplicants"
                type="number"
                {...register("maxApplicants", { valueAsNumber: true })}
              />
              {errors.maxApplicants && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.maxApplicants.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="简要介绍此次招新的目的和要求..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label>必填字段</Label>
              {isFieldsLoading ? (
                <p>加载必填字段列表中...</p>
              ) : (
                <div className="mt-2 space-y-2 border rounded-md p-3 bg-gray-50">
                  {registrationFields.length === 0 ? (
                    <p className="text-gray-500">暂无可选注册字段。</p>
                  ) : (
                    registrationFields.map((field: RegistrationField) => (
                      <div key={field.id} className="flex items-center">
                        <Checkbox
                          id={`field-${field.fieldName}`}
                          checked={watchedRequiredFields.includes(
                            field.fieldName!,
                          )}
                          onCheckedChange={(checked: boolean) =>
                            handleFieldCheckboxChange(field.fieldName!, checked)
                          }
                        />
                        <Label
                          htmlFor={`field-${field.fieldName}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {field.fieldLabel || field.fieldName}
                          {field.fieldName === "name" && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
              {errors.requiredFields && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.requiredFields.message}
                </p>
              )}
            </div>

            <div>
              <Label>自定义问题</Label>
              <p className="text-gray-500 text-sm mt-1">
                （此部分将在后续迭代中完善动态问题添加功能）
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button type="submit">更新批次</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
