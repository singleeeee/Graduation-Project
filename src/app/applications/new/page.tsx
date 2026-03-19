"use client"

import React, { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, X, Upload, FileText, Eye, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { recruitmentApi } from '@/lib/api'
import { filesApi } from '@/lib/api/files'
import type { FileCategory } from '@/lib/api/files/types'
import { useActiveRegistrationFields } from '@/hooks/use-recruitment'
import { toast } from 'sonner'
import { useCreateApplication } from '@/hooks/use-applications'


export default function NewApplicationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const recruitmentId = searchParams.get('recruitmentId')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [experiences, setExperiences] = useState<any[]>([])

  // 附件上传状态
  // 每个项记录本地文件信息 + 上传状态 + 服务端返回的 fileId
  interface AttachmentItem {
    localFile: File;
    fileType: FileCategory;
    description: string;
    // 上传状态
    status: 'idle' | 'uploading' | 'success' | 'error';
    fileId?: string;        // 上传成功后服务端返回
    errorMsg?: string;
  }
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  /** 调用后端接口上传单个附件 */
  const uploadAttachment = async (index: number) => {
    const att = attachments[index];
    if (!att || att.status === 'uploading' || att.status === 'success') return;
    setAttachments((prev) => prev.map((a, i) => i === index ? { ...a, status: 'uploading', errorMsg: undefined } : a));
    try {
      const result = await filesApi.upload({
        file: att.localFile,
        category: att.fileType,
        description: att.description || undefined,
      });
      setAttachments((prev) =>
        prev.map((a, i) => i === index ? { ...a, status: 'success', fileId: result.id } : a)
      );
    } catch (err: any) {
      setAttachments((prev) =>
        prev.map((a, i) => i === index ? { ...a, status: 'error', errorMsg: err?.message || '上传失败' } : a)
      );
      toast.error(`「${att.localFile.name}」上传失败：${err?.message || '请重试'}`);
    }
  };

  // 获取招新详情
  const { data: recruitmentData, isLoading } = useQuery({
    queryKey: ['recruitment', recruitmentId],
    queryFn: () => recruitmentApi.getRecruitment(recruitmentId!),
    enabled: !!recruitmentId,
    staleTime: 5 * 60 * 1000,
  })

  const recruitment = recruitmentData?.data

  // 获取激活的注册字段
  const { data: allRegistrationFields = [], isLoading: isFieldsLoading } = useActiveRegistrationFields()

  // 根据requiredFields筛选出需要的字段
  const requiredRegistrationFields = allRegistrationFields.filter((field: any) => 
    recruitment?.requiredFields?.includes(field.fieldName)
  )

  // 动态创建表单验证schema - 只基于requireField配置的字段
  const dynamicFormSchema = React.useMemo(() => {
    const fieldSchemas: Record<string, any> = {}
    
    // 只处理requireField配置的字段
    requiredRegistrationFields.forEach((field: any) => {
      let schema: any = z.string()
      
      // 根据字段类型添加不同的验证规则
      if (field.fieldType === 'email') {
        schema = z.string().email('请输入正确的邮箱格式')
      } else if (field.fieldType === 'number') {
        schema = z.string().regex(/^\d+$/, '请输入有效的数字')
      }
      
      // 添加必填验证
      if (field.isRequired) {
        schema = schema.min(1, `${field.fieldLabel}不能为空`)
      } else {
        schema = schema.optional()
      }
      
      // 添加长度验证
      if (field.validationRules?.minLength) {
        schema = schema.min(field.validationRules.minLength, `最少输入${field.validationRules.minLength}个字符`)
      }
      if (field.validationRules?.maxLength) {
        schema = schema.max(field.validationRules.maxLength, `最多输入${field.validationRules.maxLength}个字符`)
      }
      
      fieldSchemas[field.fieldName] = schema
    })
    
    return z.object(fieldSchemas)
  }, [requiredRegistrationFields])

  type DynamicFormData = z.infer<typeof dynamicFormSchema>

  // 根据字段类型渲染对应的表单控件
  const renderFormControl = (field: any, formField: any) => {
    const commonProps = {
      placeholder: field.placeholder || `请输入${field.fieldLabel}`,
      value: formField.value || '', // 确保value始终有值
      ...formField,
    }

    switch (field.fieldType) {
      case 'textarea':
        return <Textarea className="min-h-[100px]" {...commonProps} />
      
      case 'select':
        // 解析字段的 options（可能是 JSON 字符串或对象数组）
        const parseFieldOptions = (options: any): { label: string; value: string }[] => {
          if (!options) return []
          
          try {
            // 如果是字符串，尝试解析 JSON
            if (typeof options === 'string') {
              const parsed = JSON.parse(options)
              // 处理嵌套的 options 结构
              if (parsed.options && Array.isArray(parsed.options)) {
                return parsed.options
              }
              // 如果直接是数组
              if (Array.isArray(parsed)) {
                return parsed
              }
            }
            
            // 如果已经是数组，直接使用
            if (Array.isArray(options)) {
              return options
            }
            
            return []
          } catch (error) {
            console.warn('Failed to parse field options:', options, error)
            return []
          }
        }

        const options = parseFieldOptions(field.options)
        
        return (
          <Select 
            value={formField.value ?? ''}
            onValueChange={formField.onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `请选择${field.fieldLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'email':
        return <Input type="email" {...commonProps} />
      
      case 'number':
        return <Input type="number" {...commonProps} />
      
      case 'date':
        return <Input type="date" {...commonProps} />
      
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => {
              // 处理文件上传
              const file = e.target.files?.[0]
              if (file) {
                // 这里可以添加文件验证逻辑
                formField.onChange(file.name) // 临时保存文件名
              }
            }}
          />
        )
      
      default:
        return <Input {...commonProps} />
    }
  }

  // 初始化表单
  const form = useForm<DynamicFormData>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: React.useMemo(() => {
      const defaults: Record<string, string> = {}
    // 初始化requireField配置的字段
    requiredRegistrationFields.forEach((field: any) => {
      defaults[field.fieldName] = ''
    })
      return defaults
    }, [requiredRegistrationFields]),
    // 添加以下配置来处理受控组件
    mode: 'onChange', // 启用onChange模式
  })


  const createApplicationMutation = useCreateApplication()

  const handleSubmit = async (formData: DynamicFormData) => {
    if (!recruitmentId) {
      toast.error('招新信息无效')
      return
    }

    setIsSubmitting(true)

    try {
      // 将所有未上传的附件自动上传
      const idleOrErrorIndexes = attachments
        .map((a, i) => (a.status === 'idle' || a.status === 'error' ? i : -1))
        .filter((i) => i >= 0);
      for (const idx of idleOrErrorIndexes) {
        await uploadAttachment(idx);
      }

      // 检查是否有上传失败的附件
      const freshAttachments = attachments;
      const failedCount = freshAttachments.filter((a) => a.status === 'error').length;
      if (failedCount > 0) {
        toast.error(`${failedCount} 个附件上传失败，请删除失败项后重试`);
        setIsSubmitting(false);
        return;
      }

      // 构建 fileLinks（只包含上传成功的附件）
      const fileLinks = freshAttachments
        .filter((a) => a.status === 'success' && a.fileId)
        .map((a) => ({
          fileId: a.fileId!,
          fileType: a.fileType,
          description: a.description || undefined,
        }));

      const applicationData = {
        recruitmentId,
        formData: Object.entries(formData).reduce((acc, [key, value]) => {
          if (value && value.toString().trim() !== '') {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>),
        experiences: experiences.length > 0 ? experiences : undefined,
        fileLinks: fileLinks.length > 0 ? fileLinks : undefined,
      };

      await createApplicationMutation.mutateAsync(applicationData as any);
      
      toast.success('申请提交成功！');
      router.push('/applications');
      
    } catch (error) {
      console.error('申请提交失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载招新信息...</span>
        </div>
      </div>
    )
  }

  // 加载注册字段
  if (isFieldsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载表单字段...</span>
        </div>
      </div>
    )
  }

  if (!recruitment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            招新信息不存在或已结束
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // 检查是否还可以申请
  const canApply = 
    (recruitment.status === 'published' || recruitment.status === 'ongoing') && 
    new Date(recruitment.endTime) > new Date() &&
    (recruitment.applicationCount || 0) < recruitment.maxApplicants

  if (!canApply) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            该招新批次已结束或申请人数已满
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 招新信息卡片 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{recruitment.title}</CardTitle>
          <CardDescription>
            {/* @ts-ignore */}
            {recruitment.club.name} · {recruitment.club.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {recruitment.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">申请截止：</span>
                <br />
                {new Date(recruitment.endTime).toLocaleDateString('zh-CN')}
              </div>
              <div>
                <span className="font-medium">招募人数：</span>
                <br />
                {recruitment.maxApplicants} 人
              </div>
              <div>
                <span className="font-medium">已申请：</span>
                <br />
                {recruitment.applicationCount || 0} 人
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 申请表单 */}
      <Card>
        <CardHeader>
          <CardTitle>申请表</CardTitle>
          <CardDescription>
            请填写真实信息，以便我们更好地了解你
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* 根据requireField配置的字段 */}
              {requiredRegistrationFields.length > 0 ? (
                <div className="space-y-6">
                  {requiredRegistrationFields.map((field: any, index: number) => (
                    <FormField
                      key={`${field.id}-${index}`}
                      control={form.control}
                      name={field.fieldName}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>
                            {field.fieldLabel}
                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            {renderFormControl(field, formField)}
                          </FormControl>
                          {field.helpText && (
                            <FormDescription>{field.helpText}</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无必填字段配置</p>
                </div>
              )}

              {/* 自定义问题 */}
              {recruitment.customQuestions && recruitment.customQuestions.length > 0 && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">附加问题</h3>
                  {recruitment.customQuestions.map((question, index) => (
                    <FormItem key={question.id}>
                      <FormLabel>
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </FormLabel>
                      <FormControl>
                        {question.type === 'textarea' ? (
                          <Textarea 
                            placeholder="请输入你的回答" 
                            className="min-h-[100px]"
                          />
                        ) : (
                          <Input placeholder="请输入你的回答" />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>
              )}

              {/* 相关经历 */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">相关经历</h3>
                  <Button 
                    type="button" 
                    onClick={() => {
                      setExperiences([...experiences, {
                        type: 'project',
                        title: '',
                        description: '',
                        startDate: '',
                        endDate: '',
                        skills: [],
                        achievements: ''
                      }])
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    添加经历
                  </Button>
                </div>
                
                {experiences.map((exp, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">经历 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExperiences = experiences.filter((_, i) => i !== index)
                            setExperiences(newExperiences)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>类型</Label>
                          <Select value={exp.type} onValueChange={(value) => {
                            const newExperiences = [...experiences]
                            newExperiences[index].type = value
                            setExperiences(newExperiences)
                          }}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="project">项目经历</SelectItem>
                              <SelectItem value="internship">实习经历</SelectItem>
                              <SelectItem value="competition">竞赛经历</SelectItem>
                              <SelectItem value="volunteer">志愿经历</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>标题</Label>
                          <Input 
                            value={exp.title} 
                            onChange={(e) => {
                              const newExperiences = [...experiences]
                              newExperiences[index].title = e.target.value
                              setExperiences(newExperiences)
                            }}
                            placeholder="请输入经历标题"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label>描述</Label>
                          <Textarea 
                            value={exp.description} 
                            onChange={(e) => {
                              const newExperiences = [...experiences]
                              newExperiences[index].description = e.target.value
                              setExperiences(newExperiences)
                            }}
                            placeholder="请描述这段经历的详情"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label>开始时间</Label>
                          <Input 
                            type="date" 
                            value={exp.startDate} 
                            onChange={(e) => {
                              const newExperiences = [...experiences]
                              newExperiences[index].startDate = e.target.value
                              setExperiences(newExperiences)
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label>结束时间</Label>
                          <Input 
                            type="date" 
                            value={exp.endDate} 
                            onChange={(e) => {
                              const newExperiences = [...experiences]
                              newExperiences[index].endDate = e.target.value
                              setExperiences(newExperiences)
                            }}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label>涉及技能</Label>
                          <Input 
                            value={exp.skills.join(', ')} 
                            onChange={(e) => {
                              const newExperiences = [...experiences]
                              newExperiences[index].skills = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              setExperiences(newExperiences)
                            }}
                            placeholder="请用逗号分隔技能，如：React, Node.js, MongoDB"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label>成果/收获</Label>
                          <Textarea 
                            value={exp.achievements} 
                            onChange={(e) => {
                              const newExperiences = [...experiences]
                              newExperiences[index].achievements = e.target.value
                              setExperiences(newExperiences)
                            }}
                            placeholder="请描述这段经历的成果或收获"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* 附件上传 */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">附件上传</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      支持 PDF, DOC, DOCX, JPG, PNG，单个文件不超过 10 MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif';
                      input.onchange = (e: any) => {
                        const files: File[] = Array.from(e.target.files ?? []);
                        const newItems = files.map((f) => ({
                          localFile: f,
                          fileType: 'resume' as FileCategory,
                          description: '',
                          status: 'idle' as const,
                        }));
                        setAttachments((prev) => [...prev, ...newItems]);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    选择文件
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((att, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start gap-3">
                          {/* 文件图标 */}
                          <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />

                          <div className="flex-1 min-w-0 space-y-2">
                            {/* 文件名 + 状态 */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {att.localFile.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({filesApi.formatSize(att.localFile.size)})
                              </span>
                              {att.status === 'uploading' && (
                                <span className="flex items-center gap-1 text-xs text-blue-600">
                                  <Loader2 className="h-3 w-3 animate-spin" />上传中...
                                </span>
                              )}
                              {att.status === 'success' && (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />上传成功
                                </span>
                              )}
                              {att.status === 'error' && (
                                <span className="flex items-center gap-1 text-xs text-red-600">
                                  <AlertCircle className="h-3 w-3" />{att.errorMsg || '上传失败'}
                                </span>
                              )}
                            </div>

                            {/* 类型 + 描述 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-gray-500">文件类型</Label>
                                <Select
                                  value={att.fileType}
                                  disabled={att.status === 'uploading' || att.status === 'success'}
                                  onValueChange={(v) =>
                                    setAttachments((prev) =>
                                      prev.map((a, i) =>
                                        i === index ? { ...a, fileType: v as FileCategory } : a
                                      )
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="resume">简历</SelectItem>
                                    <SelectItem value="portfolio">作品集</SelectItem>
                                    <SelectItem value="certificate">证书</SelectItem>
                                    <SelectItem value="other">其他</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">描述（可选）</Label>
                                <Input
                                  className="h-8"
                                  value={att.description}
                                  disabled={att.status === 'uploading' || att.status === 'success'}
                                  onChange={(e) =>
                                    setAttachments((prev) =>
                                      prev.map((a, i) =>
                                        i === index ? { ...a, description: e.target.value } : a
                                      )
                                    )
                                  }
                                  placeholder="简单说明此文件内容"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex gap-1 flex-shrink-0">
                            {(att.status === 'idle' || att.status === 'error') && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => uploadAttachment(index)}
                              >
                                <Upload className="h-3 w-3 mr-1" />上传
                              </Button>
                            )}
                            {att.status === 'success' && att.fileId && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs"
                                onClick={() => window.open(filesApi.getViewUrl(att.fileId!), '_blank')}
                              >
                                <Eye className="h-3 w-3 mr-1" />预览
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                              disabled={att.status === 'uploading'}
                              onClick={() =>
                                setAttachments((prev) => prev.filter((_, i) => i !== index))
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || createApplicationMutation.isPending}
                >
                  {(isSubmitting || createApplicationMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting || createApplicationMutation.isPending ? '提交中...' : '提交申请'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}