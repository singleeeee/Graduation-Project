"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateRecruitmentBatch, useClubsForSelection, useRegistrationFieldsForSelection } from '@/hooks/use-recruitment'
import type { CreateRecruitmentBatchRequest, Club, RegistrationField } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

// Zod schema for form validation
const createBatchSchema = z.object({
  title: z.string().min(1, '标题是必填项'),
  clubId: z.string().min(1, '社团ID是必填项'),
  description: z.string().min(1, '描述是必填项'),
  startTime: z.string().min(1, '开始时间是必填项'),
  endTime: z.string().min(1, '结束时间是必填项'),
  maxApplicants: z.number().int().positive('最大申请人数必须是正整数'),
  requiredFields: z.array(z.string()).optional(),
  customQuestions: z.array(
    z.object({
      id: z.string().optional(),
      question: z.string().min(1, '问题内容不能为空'),
      type: z.enum(['text', 'textarea', 'select', 'radio', 'checkbox']),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ).optional(),
})

type FormData = z.infer<typeof createBatchSchema>

export default function NewRecruitmentBatchPage() {
  const router = useRouter()
  const createBatchMutation = useCreateRecruitmentBatch()

  // Hooks to fetch clubs and registration fields for selection UI
  const { data: clubs = [], isLoading: isClubsLoading, error: clubsError } = useClubsForSelection()
  const { data: registrationFields = [], isLoading: isFieldsLoading, error: fieldsError } = useRegistrationFieldsForSelection()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      title: '',
      clubId: '',
      description: '',
      startTime: '',
      endTime: '',
      maxApplicants: 1,
      requiredFields: [],
      customQuestions: [],
    }
  })

  // 自定义问题的 fieldArray
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'customQuestions',
  })

  const watchedRequiredFields = watch('requiredFields') || []
  const watchedClubId = watch('clubId')

  // Function to handle checkbox changes for requiredFields
  const handleFieldCheckboxChange = (fieldId: string, checked: boolean) => {
    const currentFields = getValues('requiredFields') || []
    let updatedFields: string[]

    if (checked) {
      updatedFields = [...currentFields, fieldId]
    } else {
      updatedFields = currentFields.filter(f => f !== fieldId)
    }
    setValue('requiredFields', updatedFields)
  }

  // 添加新问题
  const handleAddQuestion = () => {
    appendQuestion({
      question: '',
      type: 'text',
      required: false,
      options: [],
    })
  }

  const onSubmit = async (data: FormData) => {
    const processedData: CreateRecruitmentBatchRequest = {
      ...data,
      requiredFields: data.requiredFields || [],
      customQuestions: (data.customQuestions || []).map(q => ({
        id: q.id || '',
        question: q.question,
        type: q.type,
        required: q.required,
        options: q.options || [],
      })),
    }

    try {
      await createBatchMutation.mutateAsync(processedData)
      toast.success('招新批次创建成功！')
      router.push('/admin/recruitment')
    } catch (error: any) {
      const errorMessage = error?.message || '未知错误'
      toast.error('创建招新批次失败', { description: errorMessage })
    }
  }

  const onInvalid = (errors: any) => {
    const firstError = Object.entries(errors)[0]
    const fieldName = firstError?.[0]
    const message = (firstError?.[1] as any)?.message || '格式不正确'
    toast.error('表单验证失败', { description: `字段「${fieldName}」: ${message}` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">创建招新批次</h1>
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
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="clubId">选择社团</Label>
              {isClubsLoading ? (
                <p>加载社团列表中...</p>
              ) : clubsError ? (
                <p className="text-red-500">加载社团失败: {(clubsError as Error).message}</p>
              ) : (
                <Select
                  value={watchedClubId || ''}
                  onValueChange={(value) => setValue('clubId', value, { shouldValidate: true })}
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
              {errors.clubId && <p className="text-red-500 text-sm mt-1">{errors.clubId.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">开始时间</Label>
                <Input id="startTime" type="datetime-local" {...register('startTime')} />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
              </div>
              <div>
                <Label htmlFor="endTime">结束时间</Label>
                <Input id="endTime" type="datetime-local" {...register('endTime')} />
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="maxApplicants">最大申请人数</Label>
              <Input id="maxApplicants" type="number" {...register('maxApplicants', { valueAsNumber: true })} />
              {errors.maxApplicants && <p className="text-red-500 text-sm mt-1">{errors.maxApplicants.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea id="description" {...register('description')} placeholder="简要介绍此次招新的目的和要求..." />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <Label>必填字段</Label>
              {isFieldsLoading ? (
                <p>加载必填字段列表中...</p>
              ) : fieldsError ? (
                <p className="text-red-500">加载必填字段列表失败: {(fieldsError as Error).message}</p>
              ) : (
                <div className="mt-2 space-y-2 border rounded-md p-3 bg-gray-50">
                  {registrationFields.length === 0 ? (
                    <p className="text-gray-500">暂无可选注册字段。</p>
                  ) : (
                    registrationFields.map((field: RegistrationField) => (
                      <div key={field.id} className="flex items-center">
                        <Checkbox
                          id={`field-${field.fieldName}`}
                          checked={watchedRequiredFields.includes(field.fieldName!)}
                          onCheckedChange={(checked: boolean) =>
                            handleFieldCheckboxChange(field.fieldName!, checked)
                          }
                        />
                        <Label htmlFor={`field-${field.fieldName}`} className="ml-2 text-sm cursor-pointer">
                          {field.fieldLabel || field.fieldName}
                          {field.fieldName === 'name' && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
              {errors.requiredFields && <p className="text-red-500 text-sm mt-1">{errors.requiredFields.message}</p>}
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
                            value={watch(`customQuestions.${index}.type`) || 'text'}
                            onValueChange={(value) =>
                              setValue(
                                `customQuestions.${index}.type`,
                                value as 'text' | 'textarea' | 'select' | 'radio' | 'checkbox',
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
                disabled={createBatchMutation.isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={createBatchMutation.isPending}>
                {createBatchMutation.isPending ? '创建中...' : '创建批次'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
