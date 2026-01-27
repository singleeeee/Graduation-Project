"use client"

import React, { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'
import type { CreateRecruitmentBatchRequest, RecruitmentBatch } from '@/lib/api/recruitment/types'

// 表单验证模式 - 针对创建批次
const recruitmentBatchFormSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  clubId: z.string().min(1, '必须选择社团'),
  description: z.string().min(1, '描述不能为空').max(2000, '描述不能超过2000个字符'),
  startTime: z.string().min(1, '开始时间不能为空'),
  endTime: z.string().min(1, '结束时间不能为空'),
  maxApplicants: z.number().min(1, '最大申请人数至少为1').max(1000, '最大申请人数不能超过1000'),
  requiredFields: z.array(z.string()).min(1, '至少需要选择一个必填字段'),
  customQuestions: z.array(
    z.object({
      id: z.string(),
      question: z.string().min(1, '问题内容不能为空'),
      type: z.enum(['text', 'textarea', 'select', 'radio', 'checkbox']),
      required: z.boolean(),
      options: z.array(z.string()).optional()
    })
  ).optional()
})

type FormData = z.infer<typeof recruitmentBatchFormSchema>

interface RecruitmentBatchFormProps {
  clubOptions?: { id: string; name: string }[]
  registrationFieldOptions?: { id: string; name: string; fieldKey: string }[]
  onSubmit: (data: CreateRecruitmentBatchRequest) => Promise<void>
  isLoading: boolean
  submitButtonText?: string
}

export function RecruitmentBatchForm({
  clubOptions = [],
  registrationFieldOptions = [],
  onSubmit,
  isLoading,
  submitButtonText = '创建批次',
}: RecruitmentBatchFormProps) {
  const [customQuestions, setCustomQuestions] = useState<Array<{
    id: string
    question: string
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox'
    required: boolean
    options?: string[]
  }>>([])

  // 初始化表单
  const form = useForm<FormData>({
    resolver: zodResolver(recruitmentBatchFormSchema),
    defaultValues: {
      title: '',
      clubId: '',
      description: '',
      startTime: new Date().toISOString().split('T')[0],
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 默认30天后
      maxApplicants: 50,
      requiredFields: [],
      customQuestions: [],
    },
  })

  // 添加自定义问题
  const addCustomQuestion = () => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      question: '',
      type: 'text' as const,
      required: false,
      options: []
    }
    const newQuestions = [...customQuestions, newQuestion]
    setCustomQuestions(newQuestions)
    form.setValue('customQuestions', newQuestions)
  }

  // 移除自定义问题
  const removeCustomQuestion = (index: number) => {
    const newQuestions = customQuestions.filter((_, i) => i !== index)
    setCustomQuestions(newQuestions)
    form.setValue('customQuestions', newQuestions)
  }

  // 更新自定义问题
  const updateCustomQuestion = (index: number, field: string, value: any) => {
    const newQuestions = customQuestions.map((q, i) => {
      if (i === index) {
        const updated = { ...q, [field]: value }
        if (field === 'type' && !['select', 'radio', 'checkbox'].includes(value)) {
          // 清除非选项类型的问题选项
          delete updated.options
        }
        return updated
      }
      return q
    })
    setCustomQuestions(newQuestions)
    form.setValue('customQuestions', newQuestions)
  }

  const handleSubmit = async (data: FormData) => {
    try {
      const submitData: CreateRecruitmentBatchRequest = {
        ...data,
        customQuestions: data.customQuestions || []
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 标题 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>招新标题 *</FormLabel>
              <FormControl>
                <Input placeholder="输入招新标题" {...field} />
              </FormControl>
              <FormDescription>简洁清晰的标题有助于吸引候选人</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 社团选择 */}
        <FormField
          control={form.control}
          name="clubId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>选择社团 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个社团" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clubOptions.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>选择负责此次招新的社团</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 时间设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>开始时间 *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>结束时间 *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>候选人可在结束时间前提交申请</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 最大申请人数 */}
        <FormField
          control={form.control}
          name="maxApplicants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>最大申请人数 *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="输入最大申请人数"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormDescription>限制可接受的最大申请人数</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>招新描述 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="详细描述此次招新的内容、要求和相关信息"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 必填字段选择 */}
        <FormField
          control={form.control}
          name="requiredFields"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">必填字段 *</FormLabel>
                <FormDescription>选择申请表单中必须填写的字段</FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {registrationFieldOptions.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name="requiredFields"
                    render={({ field: formField }) => {
                      return (
                        <FormItem
                          key={field.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={formField.value?.includes(field.fieldKey)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...formField.value, field.fieldKey]
                                  : formField.value?.filter((value) => value !== field.fieldKey)
                                formField.onChange(newValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {field.name}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 自定义问题 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel className="text-base">自定义问题</FormLabel>
            <Button
              type="button"
              variant="outline"
              onClick={addCustomQuestion}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" /> 添加问题
            </Button>
          </div>
          <FormDescription>添加额外的申请问题以更好地了解候选人</FormDescription>
          
          {customQuestions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">问题 {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomQuestion(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Input
                value={question.question}
                onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                placeholder="输入问题内容"
              />
              
              <Select
                value={question.type}
                onValueChange={(value) => updateCustomQuestion(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择问题类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">单行文本</SelectItem>
                  <SelectItem value="textarea">多行文本</SelectItem>
                  <SelectItem value="select">下拉选择</SelectItem>
                  <SelectItem value="radio">单选</SelectItem>
                  <SelectItem value="checkbox">多选</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={question.required}
                  onCheckedChange={(checked) => updateCustomQuestion(index, 'required', checked)}
                />
                <FormLabel className="text-sm font-normal">必填</FormLabel>
              </div>
            </div>
          ))}
        </div>

        {/* 提交按钮 */}
        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? '创建中...' : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  )
}