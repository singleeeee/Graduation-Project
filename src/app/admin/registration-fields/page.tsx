"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { registrationFieldsApi } from "@/lib/api";
import type {
  RegistrationField,
  CreateRegistrationFieldRequest,
  UpdateRegistrationFieldRequest,
} from "@/lib/api/registration-fields";

interface RegistrationFieldsPageProps {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    role: string | null;
  };
  logout: () => void;
}

// 选项配置组件
interface OptionsConfigFieldProps {
  form:
    | UseFormReturn<CreateRegistrationFieldRequest>
    | UseFormReturn<UpdateRegistrationFieldRequest>;
}

interface Option {
  value: string;
  label: string;
}

function OptionsConfigField({ form }: OptionsConfigFieldProps) {
  // 解析字段的 options（可能是 JSON 字符串或对象数组）
  const parseFieldOptions = (rawOptions: any): Option[] => {
    if (!rawOptions) return [];

    try {
      // 如果是字符串，尝试解析 JSON
      if (typeof rawOptions === "string") {
        if (!rawOptions.trim()) return [];
        const parsed = JSON.parse(rawOptions);
        // 处理嵌套的 options 结构
        if (parsed.options && Array.isArray(parsed.options)) {
          return parsed.options;
        }
        // 如果直接是数组
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }

      // 如果已经是数组，直接使用
      if (Array.isArray(rawOptions)) {
        return rawOptions;
      }

      // 如果是个对象且有 options 属性
      if (rawOptions.options && Array.isArray(rawOptions.options)) {
        return rawOptions.options;
      }

      return [];
    } catch (error) {
      console.warn("Failed to parse options:", rawOptions, error);
      return [];
    }
  };

  // state 初始化，通过函数式初始化解析 form 中的 options
  const [options, setOptionsLocal] = useState<Option[]>(() => {
    try {
      const fieldOptions = form.getValues("options" as any);
      return parseFieldOptions(fieldOptions);
    } catch {
      return [];
    }
  });

  // 当组件挂载或 `form` 实例本身变化时（例如编辑模式切换了编辑项，导致表单重置），
  // 重新从父表单的 `getValues` 中同步初始的 options 状态到组件内部。
  // 这个 effect 主要用于回显父组件设置的默认值。
  useEffect(() => {
    const initialOptionsFromForm = parseFieldOptions(
      form.getValues("options" as any),
    );
    setOptionsLocal(initialOptionsFromForm);
  }, [form]); // 依赖 [form] 确保在 form 实例变化时（如编辑不同项）重新同步

  const addOption = () => {
    const newOptions = [...options, { value: "", label: "" }];
    setOptionsLocal(newOptions); // 使用 setOptionsLocal
    updateFormOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptionsLocal(newOptions); // 使用 setOptionsLocal
    updateFormOptions(newOptions);
  };

  const updateOption = (
    index: number,
    field: "value" | "label",
    newValue: string,
  ) => {
    const newOptions = options.map((option, i) =>
      i === index ? { ...option, [field]: newValue } : option,
    );
    setOptionsLocal(newOptions); // 使用 setOptionsLocal
    updateFormOptions(newOptions);
  };

  const updateFormOptions = (newOptions: Option[]) => {
    // 确保写入表单的始终是紧凑的 JSON 字符串
    const optionsString = JSON.stringify(newOptions);
    if ("options" in form.getValues()) {
      (form as any).setValue("options", optionsString);
    }
  };

  const moveOption = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= options.length) return;

    const newOptions = [...options];
    [newOptions[index], newOptions[newIndex]] = [
      newOptions[newIndex],
      newOptions[index],
    ];
    setOptionsLocal(newOptions); // 使用 setOptionsLocal
    updateFormOptions(newOptions);
  };

  return (
    <FormField
      control={(form as any).control}
      name="options"
      render={({ field, formState: { errors } }) => (
        <FormItem>
          <FormLabel>选项配置</FormLabel>
          <FormControl>
            <div className="space-y-3">
              {(Array.isArray(options) ? options : []).map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="值 (value)"
                        value={option.value}
                        onChange={(e) =>
                          updateOption(index, "value", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder="标签 (label)"
                        value={option.label}
                        onChange={(e) =>
                          updateOption(index, "label", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(index, "down")}
                      disabled={index === options.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full"
              >
                + 添加选项
              </Button>

              {options.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  预览:{" "}
                  {options
                    .map((o) => o.label)
                    .filter(Boolean)
                    .join(", ") || "请先填写选项"}
                </div>
              )}
            </div>
          </FormControl>
          <FormDescription>
            为下拉选择字段添加可选项，支持拖拽排序
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 表单验证模式
const createFieldSchema = z.object({
  fieldName: z
    .string()
    .min(1, "字段名称不能为空")
    .max(50, "字段名称不能超过50个字符"),
  fieldLabel: z
    .string()
    .min(1, "显示标签不能为空")
    .max(50, "显示标签不能超过50个字符"),
  fieldType: z.enum([
    "text",
    "email",
    "select",
    "textarea",
    "file",
    "date",
    "number",
  ]),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  isForRecruitment: z.boolean(),
  isForRegister: z.boolean(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.string().optional(),
});

function RegistrationFieldsPageContent({
  user,
  logout,
}: RegistrationFieldsPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<RegistrationField | null>(
    null,
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 获取注册字段列表
  const {
    data: fields = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["registrationFields", "admin"],
    queryFn: async () => {
      const result = await registrationFieldsApi.getRegistrationFields();
      return result || [];
    },
    enabled: true,
  });

  // 创建字段表单
  const createForm = useForm<CreateRegistrationFieldRequest>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      fieldName: "",
      fieldLabel: "",
      fieldType: "text",
      fieldOrder: fields.length,
      isRequired: false,
      isActive: true,
      isForRecruitment: false,
      isForRegister: false,
      placeholder: "",
      helpText: "",
      options: "",
    },
  });

  // 编辑字段表单
  const editForm = useForm<UpdateRegistrationFieldRequest>({
    resolver: zodResolver(createFieldSchema.partial()),
    defaultValues: {
      fieldLabel: "",
      fieldType: "text",
      isRequired: false,
      isActive: true,
      isForRecruitment: false,
      isForRegister: false,
      placeholder: "",
      helpText: "",
      options: "",
    },
  });

  // 创建字段
  const createFieldMutation = useMutation({
    mutationFn: (data: CreateRegistrationFieldRequest) => {
      const processedData = {
        ...data,
        fieldOrder: fields.length,
        options: data.fieldType === "select" ? data.options : undefined,
      };
      return registrationFieldsApi.createRegistrationField(processedData);
    },
    onSuccess: () => {
      toast({ title: "成功", description: "注册字段创建成功" });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "active"],
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "更新字段失败",
        variant: "destructive",
      });
    },
  });

  // 更新字段
  const updateFieldMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRegistrationFieldRequest;
    }) => {
      const processedData = {
        ...data,
        options: data.fieldType === "select" ? data.options : undefined,
      };
      return registrationFieldsApi.updateRegistrationField(id, processedData);
    },
    onSuccess: () => {
      toast({ title: "成功", description: "注册字段更新成功" });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "active"],
      });
      setIsEditDialogOpen(false);
      setSelectedField(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "更新字段失败",
        variant: "destructive",
      });
    },
  });

  // 删除字段
  const deleteFieldMutation = useMutation({
    mutationFn: (id: string) =>
      registrationFieldsApi.deleteRegistrationField(id),
    onSuccess: () => {
      toast({ title: "成功", description: "注册字段删除成功" });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "active"],
      });
      setIsDeleteDialogOpen(false);
      setSelectedField(null);
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "删除字段失败",
        variant: "destructive",
      });
    },
  });

  // 更新字段顺序
  const updateOrderMutation = useMutation({
    mutationFn: (fields: { id: string; order: number }[]) =>
      registrationFieldsApi.updateFieldOrder(fields),
    onSuccess: () => {
      toast({ title: "成功", description: "字段顺序更新成功" });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["registrationFields", "active"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "更新顺序失败",
        variant: "destructive",
      });
    },
  });

  const handleCreateField = (data: CreateRegistrationFieldRequest) => {
    createFieldMutation.mutate(data);
  };

  const handleUpdateField = (data: UpdateRegistrationFieldRequest) => {
    if (selectedField) {
      updateFieldMutation.mutate({ id: selectedField.id, data });
    } else {
      toast({
        title: "错误",
        description: "未选择要更新的字段",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = () => {
    if (selectedField) {
      deleteFieldMutation.mutate(selectedField.id);
    }
  };

  const handleEditClick = (field: RegistrationField) => {
    setSelectedField(field);
    editForm.reset({
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      isActive: field.isActive,
      isForRecruitment: field.isForRecruitment || false,
      isForRegister: field.isForRegister || false,
      placeholder: field.placeholder || "",
      helpText: field.helpText || "",
      options: field.fieldType === "select" ? field.options : "", // 非下拉类型字段将options设置为空字符串
    });
    setIsEditDialogOpen(true);
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [
      newFields[newIndex],
      newFields[index],
    ];

    // 遍历所有字段，并为每个字段分配新的 fieldOrder
    newFields.forEach((field, idx) => {
      // 简单的 UUID 校验 (非严格，主要检查长度和字符)
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!field.id || !uuidRegex.test(field.id)) {
        console.error(
          `Invalid field ID encountered during reorder: ${field.id}. Skipping update for this field.`,
        );
        return; // 跳过无效 ID 的字段
      }

      // 构建用于更新的数据对象
      const updateData: UpdateRegistrationFieldRequest = {
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        isActive: field.isActive,
        placeholder: field.placeholder || "",
        helpText: field.helpText || "",
        fieldOrder: idx, // 更新 fieldOrder
        // 确保传递给 API 的 options 是 JSON 字符串
        options:
          field.fieldType === "select" && field.options
            ? typeof field.options === "string"
              ? field.options
              : JSON.stringify(field.options)
            : undefined,
      };

      // 调用 updateFieldMutation 逐个更新每个字段的 fieldOrder
      updateFieldMutation.mutate({ id: field.id, data: updateData });
    });
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "email":
        return "bg-green-100 text-green-800";
      case "select":
        return "bg-purple-100 text-purple-800";
      case "textarea":
        return "bg-yellow-100 text-yellow-800";
      case "file":
        return "bg-pink-100 text-pink-800";
      case "date":
        return "bg-indigo-100 text-indigo-800";
      case "number":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFieldType = (type: string) => {
    switch (type) {
      case "text":
        return "单行文本";
      case "email":
        return "邮箱";
      case "select":
        return "下拉选择";
      case "textarea":
        return "多行文本";
      case "file":
        return "文件上传";
      case "date":
        return "日期";
      case "number":
        return "数字";
      default:
        return type;
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">加载注册字段配置失败</div>
        <Button onClick={() => window.location.reload()}>重新加载</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">字段配置管理</h1>
          <p className="text-gray-600 mt-1">
            管理用户注册和招新时需要填写的字段
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加字段
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加字段</DialogTitle>
              <DialogDescription>
                创建新的字段，支持多种字段类型和验证规则，可用于用户注册或招新
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateField)}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="fieldName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>字段名称 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="如：studentId, phone, major"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          英文标识，用于后端处理
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="fieldLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>显示标签 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="如：学号、手机号、专业"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>用户看到的字段名称</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="fieldType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字段类型 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择字段类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">单行文本</SelectItem>
                          <SelectItem value="email">邮箱</SelectItem>
                          <SelectItem value="textarea">多行文本</SelectItem>
                          <SelectItem value="select">下拉选择</SelectItem>
                          <SelectItem value="file">文件上传</SelectItem>
                          <SelectItem value="date">日期</SelectItem>
                          <SelectItem value="number">数字</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>选择合适的数据类型</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {createForm.watch("fieldType") === "select" && (
                  <OptionsConfigField
                    key={`create-form-options-${createForm.watch("fieldType")}`}
                    form={createForm}
                  />
                )}

                <FormField
                  control={createForm.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>占位符文本</FormLabel>
                      <FormControl>
                        <Input placeholder="输入占位符文本" {...field} />
                      </FormControl>
                      <FormDescription>
                        字段为空时显示的提示文本
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>帮助文本</FormLabel>
                      <FormControl>
                        <Textarea placeholder="输入帮助说明" {...field} />
                      </FormControl>
                      <FormDescription>提供给用户的额外说明</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">必填字段</FormLabel>
                          <FormDescription>
                            用户注册时是否必须填写此字段
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">启用字段</FormLabel>
                          <FormDescription>
                            是否在注册表单中显示此字段
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="isForRecruitment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">招新字段</FormLabel>
                          <FormDescription>
                            是否在招新批次中使用此字段
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="isForRegister"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">注册字段</FormLabel>
                          <FormDescription>
                            是否在用户注册时使用此字段
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFieldMutation.isPending}
                  >
                    {createFieldMutation.isPending ? "创建中..." : "创建字段"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 编辑字段对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑字段</DialogTitle>
              <DialogDescription>
                修改字段的配置信息，可调整其在注册或招新中的使用方式
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleUpdateField)}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="fieldLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>显示标签</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>字段类型</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">单行文本</SelectItem>
                            <SelectItem value="email">邮箱</SelectItem>
                            <SelectItem value="textarea">多行文本</SelectItem>
                            <SelectItem value="select">下拉选择</SelectItem>
                            <SelectItem value="file">文件上传</SelectItem>
                            <SelectItem value="date">日期</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {editForm.watch("fieldType") === "select" && (
                  <OptionsConfigField
                    key={`edit-form-options-${editForm.watch("fieldType")}`}
                    form={editForm}
                  />
                )}

                <FormField
                  control={editForm.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>占位符文本</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>帮助文本</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">必填字段</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">启用字段</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="isForRecruitment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">招新字段</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="isForRegister"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">注册字段</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedField(null);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateFieldMutation.isPending}
                  >
                    {updateFieldMutation.isPending ? "更新中..." : "更新字段"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除字段</DialogTitle>
              <DialogDescription>
                您确定要删除注册字段 "{selectedField?.fieldLabel}"
                吗？此操作将同时删除所有用户的相关数据，且无法撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedField(null);
                }}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteField}
                disabled={deleteFieldMutation.isPending}
              >
                {deleteFieldMutation.isPending ? "删除中..." : "确认删除"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 字段列表 */}
      <Card>
        <CardHeader>
          <CardTitle>字段列表</CardTitle>
          <CardDescription>
            共 {fields.length} 个字段，按显示顺序排列
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">顺序</TableHead>
                  <TableHead>字段信息</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>必填</TableHead>
                  <TableHead>招新</TableHead>
                  <TableHead>注册</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : fields.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      暂无注册字段，点击"添加字段"按钮创建第一个字段
                    </TableCell>
                  </TableRow>
                ) : (
                  fields
                    .sort((a, b) => a.fieldOrder - b.fieldOrder)
                    .map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(index, "up")}
                              disabled={
                                index === 0 || updateOrderMutation.isPending
                              }
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(index, "down")}
                              disabled={
                                index === fields.length - 1 ||
                                updateOrderMutation.isPending
                              }
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {field.fieldLabel}
                            </div>
                            <div className="text-sm text-gray-500">
                              {field.fieldName}
                            </div>
                            {field.placeholder && (
                              <div className="text-xs text-gray-400">
                                占位符: {field.placeholder}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFieldTypeColor(field.fieldType)}>
                            {formatFieldType(field.fieldType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              field.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {field.isActive ? "启用" : "禁用"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              field.isRequired
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {field.isRequired ? "必填" : "选填"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              field.isForRecruitment
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {field.isForRecruitment ? "是" : "否"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              field.isForRegister
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {field.isForRegister ? "是" : "否"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(field.createdAt).toLocaleDateString(
                            "zh-CN",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(field)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedField(field);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegistrationFieldsPage() {
  return (
    <ProtectedRoute permission="registration_field_manage">
      <RegistrationFieldsPageContent
        user={{
          id: "admin-1",
          name: "超级管理员",
          email: "admin@example.com",
          role: "system_admin",
        }}
        logout={() => {
          const { logout: logoutStore } = useAppStore.getState();
          logoutStore();
          window.location.href = "/login";
        }}
      />
    </ProtectedRoute>
  );
}
