import React, { useState } from 'react'
import { useForm, useFormContext, Controller, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import registrationFieldsApi, { type RegistrationField } from '@/lib/api/registration-fields'

// 解析字段的 options（可能是 JSON 字符串或对象数组）
function parseFieldOptions(options: any): { label: string; value: string }[] {
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

// 动态生成表单验证Schema
function createDynamicSchema(fields: RegistrationField[]) {
  const allFields: Record<string, any> = {
    name: z.string().min(2, '姓名至少需要2个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少需要6个字符').max(50, '密码不能超过50个字符'),
    confirmPassword: z.string().min(6, '请确认密码'),
  }
  
  fields.forEach(field => {
    let fieldSchema: any
    
    switch (field.fieldType) {
      case 'text':
        fieldSchema = z.string()
        if (field.validationRules?.minLength) {
          fieldSchema = fieldSchema.min(field.validationRules.minLength, 
            `至少需要${field.validationRules.minLength}个字符`)
        }
        if (field.validationRules?.maxLength) {
          fieldSchema = fieldSchema.max(field.validationRules.maxLength, 
            `不能超过${field.validationRules.maxLength}个字符`)
        }
        break
      case 'textarea':
        fieldSchema = z.string()
        if (field.validationRules?.minLength) {
          fieldSchema = fieldSchema.min(field.validationRules.minLength, 
            `至少需要${field.validationRules.minLength}个字符`)
        }
        if (field.validationRules?.maxLength) {
          fieldSchema = fieldSchema.max(field.validationRules.maxLength, 
            `不能超过${field.validationRules.maxLength}个字符`)
        }
        break
      case 'email':
        fieldSchema = z.string().email('请输入有效的邮箱地址')
        break
      case 'number':
        fieldSchema = z.string().regex(/^\d+$/, '请输入有效的数字')
        break
      case 'select':
        fieldSchema = z.string()
        const parsedOptions = parseFieldOptions(field.options)
        if (parsedOptions.length > 0) {
          fieldSchema = fieldSchema.refine((val: string) => {
            return parsedOptions.some(option => option.value === val)
          }, '请选择一个有效的选项')
        }
        break
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '请输入有效的日期格式 (YYYY-MM-DD)')
        break
      case 'file':
        // 文件类型在前端用字符串处理（文件路径）
        fieldSchema = z.string().optional()
        break
      default:
        fieldSchema = z.string()
    }
    
    if (!field.isRequired) {
      fieldSchema = fieldSchema.optional()
    } else {
      // 使用 refine 方法来确保必填字段不为空，而不是使用 min 方法
      // 这样可以避免在某些字段类型上使用 min 方法导致的错误
      fieldSchema = fieldSchema.refine((val: string) => {
        return val !== undefined && val !== null && val.trim() !== ''
      }, `${field.fieldLabel}是必填项`)
    }
    
    allFields[field.fieldName] = fieldSchema
  })
  
  // 创建基础schema
  const schema = z.object(allFields)
  
  // 添加密码确认验证
  return schema.refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })
}

// 动态表单字段组件
interface DynamicFormFieldProps {
  field: RegistrationField
  error?: string
}

function DynamicFormField({ field, error }: DynamicFormFieldProps) {
  const { control, setValue } = useFormContext()
  const [fileValue, setFileValue] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileValue(file.name)
      setValue(field.fieldName, file.name)
    }
  }

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
      case 'email':
        return (
          <Controller
            name={field.fieldName}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                value={formField.value ?? ''}
                type={field.fieldType}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
          />
        )

      case 'number':
        return (
          <Controller
            name={field.fieldName}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                value={formField.value ?? ''}
                type="number"
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
          />
        )

      case 'textarea':
        return (
          <Controller
            name={field.fieldName}
            control={control}
            render={({ field: formField }) => (
              <Textarea
                {...formField}
                value={formField.value ?? ''}
                rows={4}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
          />
        )

      case 'select':
        return (
          <Controller
            name={field.fieldName}
            control={control}
            render={({ field: formField }) => (
              <Select
                value={formField.value ?? ''}
                onValueChange={formField.onChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={field.placeholder || `请选择${field.fieldLabel}`} />
                </SelectTrigger>
                <SelectContent>
                  {parseFieldOptions(field.options).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )

      case 'date':
        return (
          <Controller
            name={field.fieldName}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                value={formField.value ?? ''}
                type="date"
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
          />
        )

      case 'file':
        return (
          <div className="mt-1">
            <Input
              type="file"
              onChange={handleFileChange}
              className="mb-2"
              accept="*/*"
            />
            {fileValue && (
              <p className="text-sm text-gray-600">已选择文件: {fileValue}</p>
            )}
          </div>
        )

      default:
        return (
          <Controller
            name={field.fieldName}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                value={formField.value ?? ''}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
          />
        )
    }
  }

  return (
    <div>
      <Label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700">
        <span>{field.fieldLabel}</span>
        {field.isRequired && <span className="text-red-500 ml-1" aria-label="必填">*</span>}
      </Label>
      {renderField()}
      {field.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

// 主动态表单组件
interface DynamicRegistrationFormProps {
  onSubmit: (data: any) => void
  isSubmitting?: boolean
}

export function DynamicRegistrationForm({ onSubmit, isSubmitting = false }: DynamicRegistrationFormProps) {
  // 获取动态字段配置
  const { data: dynamicFields = [], isLoading, error } = useQuery({
    queryKey: ['registrationFields', 'active'],
    queryFn: async () => {
      const result = await registrationFieldsApi.getActiveFields()
      return result || []
    },
  })

  // 处理错误
  React.useEffect(() => {
    if (error) {
      toast.error('加载失败', { description: '无法加载注册字段配置，请刷新页面重试' })
    }
  }, [error])

  // 按fieldOrder排序字段，并过滤出isForRegister为true的字段
  const sortedFields = React.useMemo(() => {
    const fieldsArray = Array.isArray(dynamicFields) ? dynamicFields : (dynamicFields?.data || [])
    return [...fieldsArray]
      .filter(field => field.isForRegister)
      .sort((a, b) => a.fieldOrder - b.fieldOrder)
  }, [dynamicFields])

  // 创建动态验证schema
  const dynamicSchema = React.useMemo(() => {
    return createDynamicSchema(sortedFields)
  }, [sortedFields])

  const formMethods = useForm({
    resolver: zodResolver(dynamicSchema),
  })
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = formMethods

  // 基础字段（始终存在）+ 动态字段
  const renderFormFields = () => {
    const formFields = []

    // 基础字段
    formFields.push(
      <div key="name">
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
          <span>姓名</span>
          <span className="text-red-500 ml-1" aria-label="必填">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          className="mt-1"
          placeholder="请输入您的真实姓名"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{(errors.name as any).message}</p>
        )}
      </div>
    )

    formFields.push(
      <div key="email">
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
          <span>邮箱</span>
          <span className="text-red-500 ml-1" aria-label="必填">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1"
          placeholder="请输入邮箱地址"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{(errors.email as any).message}</p>
        )}
      </div>
    )

    formFields.push(
      <div key="password">
        <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
          <span>密码</span>
          <span className="text-red-500 ml-1" aria-label="必填">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="mt-1"
          placeholder="请输入密码，至少6位"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{(errors.password as any).message}</p>
        )}
      </div>
    )

    formFields.push(
      <div key="confirmPassword">
        <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          <span>确认密码</span>
          <span className="text-red-500 ml-1" aria-label="必填">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="mt-1"
          placeholder="请再次输入密码"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-destructive">{(errors.confirmPassword as any).message}</p>
        )}
      </div>
    )

    // 动态字段
    sortedFields.forEach((field) => {
      formFields.push(
        <DynamicFormField
          key={field.fieldName}
          field={field}
          error={(errors as any)[field.fieldName]?.message}
        />
      )
    })

    return formFields
  }

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/70">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">加载表单配置...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="backdrop-blur-sm bg-white/70">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">加载表单配置失败</p>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <FormProvider {...formMethods}>
      <form 
          id="dynamic-register-form"
          onSubmit={formMethods.handleSubmit(onSubmit)} 
          className="space-y-4"
      >
        {renderFormFields()}
      </form>
    </FormProvider>
  )
}