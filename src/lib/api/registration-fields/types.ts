// 注册字段配置接口
export interface RegistrationField {
  id: string
  fieldName: string
  fieldLabel: string
  fieldType: 'text' | 'email' | 'select' | 'textarea' | 'file' | 'date' | 'number'
  fieldOrder: number
  isRequired: boolean
  isActive: boolean
  options?: {
    value: string
    label: string
  }[] | string // 可以是对象数组或 JSON 字符串
  validationRules?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    custom?: any
  }
  placeholder?: string
  helpText?: string
  createdAt: string
  updatedAt: string
}

// 创建注册字段请求
export interface CreateRegistrationFieldRequest {
  fieldName: string
  fieldLabel: string
  fieldType: 'text' | 'email' | 'select' | 'textarea' | 'file' | 'date' | 'number'
  fieldOrder: number
  isRequired: boolean
  isActive: boolean
  options?: {
    value: string
    label: string
  }[] | string // 可以是对象数组或 JSON 字符串
  validationRules?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    custom?: any
  }
  placeholder?: string
  helpText?: string
}

// 更新注册字段请求
export interface UpdateRegistrationFieldRequest {
  fieldLabel?: string
  fieldType?: 'text' | 'email' | 'select' | 'textarea' | 'file' | 'date' | 'number'
  fieldOrder?: number
  isRequired?: boolean
  isActive?: boolean
  options?: {
    value: string
    label: string
  }[] | string // 可以是对象数组或 JSON 字符串
  validationRules?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    custom?: any
  }
  placeholder?: string
  helpText?: string
}

// 字段列表响应
export interface RegistrationFieldListResponse {
  fields: RegistrationField[]
  total: number
}