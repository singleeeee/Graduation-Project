"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileFieldConfig } from "@/lib/api/users/types";
import {
  useProfile,
  useProfileFieldsConfig,
  useUpdateBasicInfo,
  useUpdateProfileFields,
} from "@/hooks/use-profile";
import {
  profileBasicInfoSchema,
  profileFieldSchema,
} from "@/lib/utils/validations";
import type {
  ProfileBasicInfoFormData,
  ProfileFieldFormData,
} from "@/lib/utils/validations";

// 解析字段的选项（可能是 JSON 字符串或对象数组）
function parseFieldOptions(options: any): { label: string; value: string }[] {
  if (!options) return [];

  try {
    // 如果是字符串，尝试解析 JSON
    if (typeof options === "string") {
      const parsed = JSON.parse(options);
      // 处理嵌套的 options 结构
      if (parsed.options && Array.isArray(parsed.options)) {
        return parsed.options;
      }
      // 如果直接是数组
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // 如果是对象且有options属性
    if (options.options && Array.isArray(options.options)) {
      return options.options;
    }

    // 如果已经是数组，直接使用
    if (Array.isArray(options)) {
      return options;
    }

    return [];
  } catch (error) {
    console.warn("Failed to parse field options:", options, error);
    return [];
  }
}

// 动态表单字段组件
interface DynamicFormFieldProps {
  field: ProfileFieldConfig;
  error?: string;
  value?: string;
  onChange: (value: string) => void;
}

function DynamicFormField({
  field,
  error,
  value,
  onChange,
}: DynamicFormFieldProps) {
  const [fileValue, setFileValue] = useState<string>(value || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileValue(file.name);
      onChange(file.name);
    }
  };

  const renderField = () => {
    switch (field.fieldType) {
      case "text":
      case "email":
        return (
          <Input
            value={value || ""}
            type={field.fieldType}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1"
          />
        );

      case "number":
        return (
          <Input
            value={value || ""}
            type="number"
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            rows={4}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1"
          />
        );

      case "select":
        const options = parseFieldOptions(field.options);
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="mt-1">
              <SelectValue
                placeholder={field.placeholder || `请选择${field.fieldLabel}`}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "file":
        return (
          <div className="mt-1">
            <Input
              type="file"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {fileValue && (
              <p className="mt-2 text-sm text-gray-600">
                已选择文件: {fileValue}
              </p>
            )}
          </div>
        );

      default:
        return (
          <Input
            value={value || ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1"
          />
        );
    }
  };

  return (
    <div>
      <Label
        htmlFor={field.fieldName}
        className="block text-sm font-medium text-gray-700"
      >
        <span>{field.fieldLabel}</span>
        {field.isRequired && (
          <span className="text-red-500 ml-1" aria-label="必填">
            *
          </span>
        )}
      </Label>
      {renderField()}
      {field.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

// 基本信息表单组件
function BasicInfoForm() {
  const { toast } = useToast();
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile();
  const updateBasicInfo = useUpdateBasicInfo();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const formMethods = useForm<ProfileBasicInfoFormData>({
    resolver: zodResolver(profileBasicInfoSchema),
    defaultValues: {
      name: profile?.name || "",
    },
  });

  // 当profile数据加载时更新表单默认值
  useEffect(() => {
    if (profile) {
      formMethods.reset({
        name: profile.name || "",
      });
    }
  }, [profile, formMethods, updateBasicInfo.isSuccess]);

  const onSubmit = async (data: ProfileBasicInfoFormData) => {
    try {
      const updatedProfile = await updateBasicInfo.mutateAsync(data);
      // 手动更新表单值
      formMethods.reset({
        name: updatedProfile.name || "",
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 获取表单中的当前值
      const formValues = formMethods.getValues();

      // 创建FormData对象
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("name", formValues.name || "");

      // 使用updateBasicInfo钩子上传头像
      await updateBasicInfo.mutateAsync(formData as any);
    } catch (error) {
      toast({
        title: "上传失败",
        description: "头像上传时出现错误",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载用户信息...</span>
      </div>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                <span>姓名</span>
                <span className="text-red-500 ml-1" aria-label="必填">
                  *
                </span>
              </Label>
              <Controller
                name="name"
                control={formMethods.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="mt-1"
                    placeholder="请输入您的真实姓名"
                  />
                )}
              />
              {formMethods.formState.errors.name && (
                <p className="mt-1 text-sm text-destructive">
                  {formMethods.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                邮箱
              </Label>
              <Input
                value={profile?.email || ""}
                disabled
                className="mt-1 bg-gray-50"
                placeholder="邮箱地址（不可修改）"
              />
              <p className="mt-1 text-sm text-gray-500">
                邮箱地址不可修改，如需更改请联系管理员
              </p>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700">
              头像
            </Label>
            <div className="mt-1 flex flex-col space-y-2">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="头像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {profile?.name
                        ? profile.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                  className="w-full file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {isUploading && (
                  <p className="mt-1 text-sm text-gray-600">上传中...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateBasicInfo.isPending}
            className="min-w-[120px]"
          >
            {updateBasicInfo.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </>
            ) : (
              "保存基本信息"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

// 档案字段表单组件
function ProfileFieldsForm() {
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: fieldsConfig = { fields: [] }, isLoading: configLoading } =
    useProfileFieldsConfig();
  const updateProfileFields = useUpdateProfileFields();

  const [formValues, setFormValues] = useState<ProfileFieldFormData>({});
  // 用 ref 追踪是否已完成初始化，避免 fieldsConfig 引用变化导致无限循环
  const initializedRef = React.useRef(false);

  // 初始化表单值：profile 和 fieldsConfig 都加载完成后只初始化一次
  useEffect(() => {
    // 已初始化过则跳过（除非 profile 数据本身发生变化，通过 profile.id 判断）
    if (!profile || initializedRef.current) return;
    // fieldsConfig 还在加载中时等待
    if (configLoading) return;

    const initialValues: ProfileFieldFormData = {};

    // 首先处理字段配置中的字段
    if (fieldsConfig.fields.length > 0) {
      fieldsConfig.fields.forEach((field) => {
        // 优先使用字段的currentValue，其次使用profile中的对应字段
        const value =
          field.currentValue ||
          profile.profileFields?.[field.fieldName] ||
          (profile as any)[field.fieldName] ||
          "";
        initialValues[field.fieldName] = value;
      });
    } else if (profile.profileFields) {
      // 如果没有字段配置，根据profileFields字段动态生成
      Object.entries(profile.profileFields).forEach(([key, value]) => {
        initialValues[key] = value as string;
      });
    }

    setFormValues(initialValues);
    initializedRef.current = true;
  // 只依赖稳定的 id/loading 标志，避免对象引用变化触发无限循环
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(profile as any)?.id, configLoading]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await updateProfileFields.mutateAsync({
        profileFields: formValues as { [key: string]: string },
      });
      // 手动更新表单值，使用API响应返回的profileFields
      setFormValues(response.profileFields || {});
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  if (profileLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载档案字段配置...</span>
      </div>
    );
  }

  // 准备要显示的字段：以 fieldsConfig.fields 为主，回填 profileFields 已有的值
  const fieldsToDisplay: (ProfileFieldConfig & { currentValue: string })[] = [];

  if (fieldsConfig.fields.length > 0) {
    // 有字段配置时，直接以配置为准展示所有字段
    fieldsConfig.fields.forEach((field) => {
      fieldsToDisplay.push({
        ...field,
        currentValue:
          (profile?.profileFields?.[field.fieldName] as string) ??
          (profile as any)?.[field.fieldName] ??
          field.currentValue ??
          "",
      });
    });
  } else if (profile?.profileFields && Object.keys(profile.profileFields).length > 0) {
    // 没有字段配置时，根据 profileFields 动态生成
    Object.entries(profile.profileFields).forEach(([key, value]) => {
      fieldsToDisplay.push({
        id: key,
        fieldName: key,
        fieldLabel: key.charAt(0).toUpperCase() + key.slice(1),
        fieldType: "text",
        isRequired: false,
        placeholder: `请输入${key}`,
        options: undefined,
        helpText: "",
        currentValue: value as string,
      });
    });
  }

  if (fieldsToDisplay.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无可编辑的档案字段</p>
        <p className="text-sm mt-1">请联系管理员配置档案字段</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fieldsToDisplay.map((field) => (
          <DynamicFormField
            key={field.fieldName}
            field={field}
            value={formValues[field.fieldName] || ""}
            onChange={(value) => handleFieldChange(field.fieldName, value)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateProfileFields.isPending}
          className="min-w-[120px]"
        >
          {updateProfileFields.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              保存中...
            </>
          ) : (
            "保存档案字段"
          )}
        </Button>
      </div>
    </form>
  );
}

interface ProfileFormProps {
  isEmbedded?: boolean;
}

// 主组件
export default function ProfileForm({ isEmbedded = false }: ProfileFormProps) {
  return (
    <div className="space-y-6">
      {/* 嵌入式模式下移除Tabs，并排显示两个表单 */}
      {isEmbedded ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本信息表单 - 嵌入式模式 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">基本信息</CardTitle>
              <CardDescription>管理您的基本个人资料信息</CardDescription>
            </CardHeader>
            <CardContent>
              <BasicInfoForm />
            </CardContent>
          </Card>

          {/* 档案字段表单 - 嵌入式模式 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">档案字段</CardTitle>
              <CardDescription>管理您的详细档案信息</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileFieldsForm />
            </CardContent>
          </Card>
        </div>
      ) : (
        /* 非嵌入式模式保留原来的Tabs结构 */
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="fields">档案字段</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>管理您的基本个人资料信息</CardDescription>
              </CardHeader>
              <CardContent>
                <BasicInfoForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fields">
            <Card>
              <CardHeader>
                <CardTitle>档案字段</CardTitle>
                <CardDescription>
                  管理您的详细档案信息，这些信息将用于申请和审核
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileFieldsForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
