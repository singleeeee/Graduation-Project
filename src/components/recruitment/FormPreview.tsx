"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, User, Mail, Phone, Calendar, Hash, FileInput } from 'lucide-react'
import type { RegistrationField } from '@/lib/api/registration-fields'

interface FormPreviewProps {
  fields: RegistrationField[]
}

export function FormPreview({ fields }: FormPreviewProps) {
  if (!fields || fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            表单预览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">暂无必填字段配置</p>
        </CardContent>
      </Card>
    )
  }

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
      case 'textarea':
        return <FileText className="h-4 w-4 text-gray-400" />
      case 'email':
        return <Mail className="h-4 w-4 text-gray-400" />
      case 'number':
        return <Hash className="h-4 w-4 text-gray-400" />
      case 'date':
        return <Calendar className="h-4 w-4 text-gray-400" />
      case 'file':
        return <FileInput className="h-4 w-4 text-gray-400" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const renderField = (field: RegistrationField) => {
    const baseProps = {
      id: field.fieldName,
      placeholder: field.placeholder || `请输入${field.fieldLabel}`,
      disabled: true, // 预览状态，禁用输入
    }

    switch (field.fieldType) {
      case 'text':
        return <Input {...baseProps} />
      case 'email':
        return <Input {...baseProps} type="email" />
      case 'number':
        return <Input {...baseProps} type="number" />
      case 'date':
        return <Input {...baseProps} type="date" />
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            rows={3}
          />
        )
      case 'select':
        const options = Array.isArray(field.options) ? field.options : []
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={`请选择${field.fieldLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <FileInput className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">文件上传区域</p>
          </div>
        )
      default:
        return <Input {...baseProps} />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          表单预览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            以下是候选人需要填写的必填字段预览
          </p>
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center gap-2">
                {getFieldIcon(field.fieldType)}
                <Label htmlFor={field.fieldName} className="font-medium">
                  {field.fieldLabel}
                  {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}