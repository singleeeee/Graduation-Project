"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // Re-use the Textarea component
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select' // Import Select components
import { Checkbox } from '@/components/ui/checkbox' // Import Checkbox component
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateRecruitmentBatch, useClubsForSelection, useRegistrationFieldsForSelection } from '@/hooks/use-recruitment'
import type { CreateRecruitmentBatchRequest, Club, RegistrationField } from '@/lib/api'
import { toast } from 'sonner' // Assuming you have a toast library for notifications, if not, use alert or similar

// Zod schema for form validation
const createBatchSchema = z.object({
  title: z.string().min(1, '标题是必填项'),
  clubId: z.string().min(1, '社团ID是必填项'),
  description: z.string().min(1, '描述是必填项'),
  startTime: z.string().min(1, '开始时间是必填项'), // HTML5 date input returns string
  endTime: z.string().min(1, '结束时间是必填项'), // HTML5 date input returns string
  maxApplicants: z.number().int().positive('最大申请人数必须是正整数'),
  requiredFields: z.array(z.string()).optional(), // Now an actual array of strings
  customQuestions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      type: z.string(),
      required: z.boolean(),
      options: z.array(z.string()).optional()
    })
  ).optional() // For now, this will be an empty array, to be implemented later
})

export default function NewRecruitmentBatchPage() {
  const router = useRouter()
  const createBatchMutation = useCreateRecruitmentBatch()

  // Hooks to fetch clubs and registration fields for selection UI
  const { data: clubs = [], isLoading: isClubsLoading, error: clubsError } = useClubsForSelection()
  const { data: registrationFields = [], isLoading: isFieldsLoading, error: fieldsError } = useRegistrationFieldsForSelection()

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm<CreateRecruitmentBatchRequest>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      title: '',
      clubId: '',
      description: '',
      startTime: '',
      endTime: '',
      maxApplicants: 0,
      requiredFields: [], // Initialize as empty, let admin select from checkboxes
      customQuestions: [] // Initialize as empty, add UI to manage later
    }
  })

  // Watch for changes to the requiredFields field to ensure UI updates correctly
  const watchedRequiredFields = watch('requiredFields') || []

  // Debug: Log watchedRequiredFields to see what's actually being stored
  React.useEffect(() => {
    console.log('watchedRequiredFields changed:', watchedRequiredFields)
  }, [watchedRequiredFields])

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

  const onSubmit = async (data: CreateRecruitmentBatchRequest) => {
    console.log('Form submission data:', data)
    // The 'requiredFields' is already an array of strings from the UI, no need for further processing.
    // For simplicity, customQuestions is an empty array for now.
    const processedData: CreateRecruitmentBatchRequest = {
      ...data,
      requiredFields: data.requiredFields || [],
      customQuestions: []
    }
    console.log('Processed data for API:', processedData)

    try {
      await createBatchMutation.mutateAsync(processedData)
      toast.success('招新批次创建成功！')
      router.push('/admin/recruitment') // Redirect back to the recruitment list
    } catch (error) {
      console.error('创建招新批次失败:', error)
      toast.error('创建招新批次失败，请重试。')
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <p className="text-red-500">加载社团失败: {clubsError.message}</p>
              ) : (
                <Select onValueChange={(value) => setValue('clubId', value)} defaultValue={getValues('clubId')}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择社团" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club: Club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name} {/* Assuming Club type has a 'name' property */}
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
                <p className="text-red-500">加载必填字段列表失败: {fieldsError.message}</p>
              ) : (
                <div className="mt-2 space-y-2 border rounded-md p-3 bg-gray-50">
                  {registrationFields.length === 0 ? (
                    <p className="text-gray-500">暂无可选注册字段。</p>
                  ) : (
                    registrationFields.map((field: RegistrationField) => (
                      <div key={field.id} className="flex items-center">
                        <Checkbox
                          id={`field-${field.id}`}
                          checked={watchedRequiredFields.includes(field.id!)}
                          onCheckedChange={(checked: boolean) =>
                            handleFieldCheckboxChange(field.id!, checked)
                          }
                        />
                        <Label htmlFor={`field-${field.id}`} className="ml-2 text-sm cursor-pointer">
                          {field.fieldLabel || field.fieldName} {/* Display the user-friendly field label or fallback */}
                          {/* Assuming 'name' field is still important, keep the asterisk for it */}
                          {field.fieldName === 'name' && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
              {errors.requiredFields && <p className="text-red-500 text-sm mt-1">{errors.requiredFields.message}</p>}
            </div>

            {/* Custom Questions section - placeholder for now */}
            <div>
              <Label>自定义问题</Label>
              <p className="text-gray-500 text-sm mt-1">
                （此部分将在后续迭代中完善动态问题添加功能）
              </p>
              {/* Placeholder for future dynamic custom questions UI */}
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