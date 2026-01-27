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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileText, Upload } from 'lucide-react'
import { CandidateLayout } from '@/components/layout/CandidateLayout'
import { recruitmentApi, registrationFieldsApi } from '@/lib/api'
import { useActiveRegistrationFields } from '@/hooks/use-recruitment'
import { toast } from 'sonner'


export default function NewApplicationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const recruitmentId = searchParams.get('recruitmentId')
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const requiredRegistrationFields = allRegistrationFields.filter(field => 
    recruitment?.requiredFields?.includes(field.id)
  )

  // 动态创建表单验证schema
  const dynamicFormSchema = React.useMemo(() => {
    const fieldSchemas: Record<string, any> = {}
    
    requiredRegistrationFields.forEach(field => {
      let schema: any = z.string()
      
      // 根据字段类型添加不同的验证规则
      if (field.fieldType === 'email') {
        schema = z.string().email('请输入正确的邮箱格式')
      } else if (field.fieldType === 'number') {
        schema = z.string().regex(/^\d+$/, '请输入有效的数字')
      } else {
        schema = z.string()
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
      requiredRegistrationFields.forEach(field => {
        defaults[field.fieldName] = ''
      })
      return defaults
    }, [requiredRegistrationFields]),
    // 添加以下配置来处理受控组件
    mode: 'onChange', // 启用onChange模式
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件大小 (最大5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过5MB')
        return
      }
      
      // 检查文件类型
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('只支持PDF或Word文档格式')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (data: DynamicFormData) => {
    if (!recruitmentId) {
      toast.error('招新信息无效')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: 实现申请提交逻辑
      // 这里需要根据后端API进行调整
      
      console.log('提交申请:', {
        recruitmentId,
        formData: data,
        resume: selectedFile, // 可能为null，表示没有上传简历
        requiredFields: requiredRegistrationFields
      })

      toast.success('申请提交成功！')
      router.push('/applications') // 跳转到申请列表页面
      
    } catch (error) {
      console.error('申请提交失败:', error)
      toast.error('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <CandidateLayout title="提交申请" showStats={false}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载招新信息...</span>
        </div>
      </CandidateLayout>
    )
  }

  // 加载注册字段
  if (isFieldsLoading) {
    return (
      <CandidateLayout title="提交申请" showStats={false}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载表单字段...</span>
        </div>
      </CandidateLayout>
    )
  }

  if (!recruitment) {
    return (
      <CandidateLayout title="提交申请" showStats={false}>
        <Alert variant="destructive">
          <AlertDescription>
            招新信息不存在或已结束
          </AlertDescription>
        </Alert>
      </CandidateLayout>
    )
  }

  // 检查是否还可以申请
  const canApply = 
    (recruitment.status === 'published' || recruitment.status === 'ongoing') && 
    new Date(recruitment.endTime) > new Date() &&
    (recruitment.applicationCount || 0) < recruitment.maxApplicants

  if (!canApply) {
    return (
      <CandidateLayout title="提交申请" showStats={false}>
        <Alert>
          <AlertDescription>
            该招新批次已结束或申请人数已满
          </AlertDescription>
        </Alert>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout title="提交申请" showStats={false}>
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
              {/* 动态必填字段 */}
              {requiredRegistrationFields.length > 0 && (
                <div className="space-y-6">
                  {requiredRegistrationFields.map((field) => (
                    <FormField
                      key={field.id}
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

              {/* 简历上传 */}
              <div className="space-y-4 border-t pt-6">
                <FormLabel>简历上传（可选）</FormLabel>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-green-500 mx-auto" />
                        <p className="text-green-600 font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          文件大小: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button type="button" variant="outline" onClick={() => setSelectedFile(null)}>
                          重新选择
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-gray-600">点击选择文件或拖拽文件到这里</p>
                        <p className="text-sm text-gray-500">支持PDF、Word格式，最大5MB</p>
                        <Button type="button" variant="outline">
                          选择文件
                        </Button>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? '提交中...' : '提交申请'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CandidateLayout>
  )
}