import axiosService, { type ApiResponse } from '../../axios'
import type {
  RegistrationField,
  CreateRegistrationFieldRequest,
  UpdateRegistrationFieldRequest,
  RegistrationFieldListResponse
} from './types'

// 导出类型以供其他模块使用
export type {
  RegistrationField,
  CreateRegistrationFieldRequest,
  UpdateRegistrationFieldRequest,
  RegistrationFieldListResponse
} from './types'

class RegistrationFieldsApi {
  private axios = axiosService

  /**
   * 获取启用的注册字段配置（需要超级管理员权限）
   */
  async getRegistrationFields(): Promise<RegistrationField[]> {
    const response = await this.axios.get<any>('/admin/registration-fields')
    // 处理API响应格式，可能是直接数据或包装的对象
    const fieldsData = response.data || response
    return Array.isArray(fieldsData) ? fieldsData || [] : []
  }

  /**
   * 创建新的注册字段（需要超级管理员权限）
   */
  async createRegistrationField(data: CreateRegistrationFieldRequest): Promise<RegistrationField> {
    const response = await this.axios.post<any>('/admin/registration-fields', data)
    // 处理API响应格式，可能是直接数据或包装的对象
    return response.data || response
  }

  /**
   * 更新注册字段配置（需要超级管理员权限）
   */
  async updateRegistrationField(id: string, data: UpdateRegistrationFieldRequest): Promise<RegistrationField> {
    const response = await this.axios.put<any>(`/admin/registration-fields/${id}`, data)
    return response.data || response
  }

  /**
   * 删除注册字段（需要超级管理员权限）
   */
  async deleteRegistrationField(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.axios.delete<ApiResponse<{ message: string }>>(`/admin/registration-fields/${id}`)
    return response
  }

  /**
   * 批量更新字段顺序（需要超级管理员权限）
   */
  async updateFieldOrder(fields: { id: string; order: number }[]): Promise<ApiResponse<{ message: string }>> {
    const response = await this.axios.put<ApiResponse<{ message: string }>>('/admin/registration-fields/order', { fields })
    return response
  }

  /**
   * 获取激活的注册字段（用于注册页面）
   */
  async getActiveFields(): Promise<ApiResponse<RegistrationField[]>> {
    const response = await this.axios.get<ApiResponse<RegistrationField[]>>('/registration-fields/active')
    return response
  }
}

// 创建单例
const registrationFieldsApi = new RegistrationFieldsApi()

export default registrationFieldsApi