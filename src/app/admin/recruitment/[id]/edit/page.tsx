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
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";

// Zod schema for form validation
// customQuestions.id 是可选的，后端有时候不返回 id 字段
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
        id: z.string().optional(),
        question: z.string().min(1, "问题内容不能为空"),
        type: z.enum(["text", "textarea", "select", "radio", "checkbox"]),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

type FormData = z.infer<typeof updateBatchSchema>;

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
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(updateBatchSchema),
    defaultValues: {
      title: "",
      clubId: "",
      description: "",
      startTime: "",
      endTime: "",
      maxApplicants: 1,
      requiredFields: [],
      customQuestions: [],
    },
  });

  // 自定义问题的 fieldArray
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "customQuestions",
  });

  // 第一步：recruitment 数据到达时立即填充所有字段（含 clubId）
  // reset 时不触发校验（keepErrors:false），避免 clubId 空字符串瞬间报错
  React.useEffect(() => {
    if (!recruitment) return;
    const clubId = recruitment.clubId || (recruitment as any).club?.id || "";
    const customQuestions = (recruitment.customQuestions || []).map((q: any) => ({
      id: q.id || undefined,
      question: q.question || "",
      type: (["text", "textarea", "select", "radio", "checkbox"].includes(q.type)
        ? q.type
        : "text") as "text" | "textarea" | "select" | "radio" | "checkbox",
      required: typeof q.required === "boolean" ? q.required : false,
      options: q.options || [],
    }));
    reset(
      {
        title: recruitment.title || "",
        clubId,
        description: recruitment.description || "",
        startTime: recruitment.startTime
          ? new Date(recruitment.startTime).toISOString().slice(0, 16)
          : "",
        endTime: recruitment.endTime
          ? new Date(recruitment.endTime).toISOString().slice(0, 16)
          : "",
        maxApplicants: recruitment.maxApplicants || 1,
        requiredFields: recruitment.requiredFields || [],
        customQuestions,
      },
      { keepErrors: false }  // 重置时清除所有错误，避免空 clubId 触发报错
    );
  }, [recruitment, reset]);

  // 第二步：clubs 列表就绪后，重新 setValue 让 Radix Select 识别已选中的 option
  // Radix Select 需要 options 挂载后才能匹配 value，所以延一帧再设一次
  React.useEffect(() => {
    if (!recruitment || isClubsLoading || clubs.length === 0) return;
    const clubId = recruitment.clubId || (recruitment as any).club?.id || "";
    if (!clubId) return;
    const timer = setTimeout(() => {
      setValue("clubId", clubId, { shouldValidate: false });
    }, 0);
    return () => clearTimeout(timer);
  }, [recruitment, clubs, isClubsLoading, setValue]);

  const watchedRequiredFields = watch("requiredFields") || [];
  const watchedClubId = watch("clubId");

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

  // 添加新问题
  const handleAddQuestion = () => {
    appendQuestion({
      question: "",
      type: "text",
      required: false,
      options: [],
    });
  };

  // 实现实际的更新批次的 API 调用
  const onSubmit = async (data: FormData) => {
    const processedData: CreateRecruitmentBatchRequest = {
      ...data,
      requiredFields: data.requiredFields || [],
      customQuestions: (data.customQuestions || []).map((q) => ({
        id: q.id || "",
        question: q.question,
        type: q.type,
        required: q.required,
        options: q.options || [],
      })),
    };

    try {
      await recruitmentApi.updateRecruitmentBatch(id, processedData);
      toast.success("招新批次更新成功！");
      queryClient.invalidateQueries({ queryKey: ["recruitment", id] });
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      router.push(`/admin/recruitment/${id}`);
    } catch (error: any) {
      const errorMessage = error?.message || "未知错误";
      toast.error("更新失败", { description: errorMessage });
    }
  };

  // 验证失败时给用户提示
  const onInvalid = (errors: any) => {
    const firstError = Object.entries(errors)[0];
    const fieldName = firstError?.[0];
    const message = (firstError?.[1] as any)?.message || "格式不正确";
    toast.error("表单验证失败", { description: `字段「${fieldName}」: ${message}` });
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
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
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
                  value={watchedClubId || ""}
                  onValueChange={(value) => setValue("clubId", value, { shouldValidate: true })}
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

            {/* 自定义问题模块 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>自定义问题</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  添加问题
                </Button>
              </div>

              {questionFields.length === 0 ? (
                <div className="border rounded-md p-4 bg-gray-50 text-center text-gray-500 text-sm">
                  暂无自定义问题，点击右上角"添加问题"按钮添加
                </div>
              ) : (
                <div className="space-y-3">
                  {questionFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-md p-4 bg-gray-50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          问题 {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <Label htmlFor={`q-content-${index}`} className="text-sm">
                          问题内容
                        </Label>
                        <Input
                          id={`q-content-${index}`}
                          {...register(`customQuestions.${index}.question`)}
                          placeholder="请输入问题内容..."
                          className="mt-1"
                        />
                        {errors.customQuestions?.[index]?.question && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.customQuestions[index]?.question?.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`q-type-${index}`} className="text-sm">
                            问题类型
                          </Label>
                          <Select
                            value={watch(`customQuestions.${index}.type`) || "text"}
                            onValueChange={(value) =>
                              setValue(
                                `customQuestions.${index}.type`,
                                value as "text" | "textarea" | "select" | "radio" | "checkbox",
                              )
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">单行文本</SelectItem>
                              <SelectItem value="textarea">多行文本</SelectItem>
                              <SelectItem value="select">下拉选择</SelectItem>
                              <SelectItem value="radio">单选</SelectItem>
                              <SelectItem value="checkbox">多选</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end pb-1">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`q-required-${index}`}
                              checked={watch(`customQuestions.${index}.required`) || false}
                              onCheckedChange={(checked: boolean) =>
                                setValue(`customQuestions.${index}.required`, checked)
                              }
                            />
                            <Label
                              htmlFor={`q-required-${index}`}
                              className="text-sm cursor-pointer"
                            >
                              必填
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
