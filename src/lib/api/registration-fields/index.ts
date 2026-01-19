import axiosService from '../../axios'
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
   * 获取所有注册字段配置（需要超级管理员权限）
   */
  async getRegistrationFields(): Promise<RegistrationField[]> {
    const response = await this.axios.get<RegistrationField[]>('/admin/registration-fields')
    return response.data
  }

  /**
   * 创建新的注册字段（需要超级管理员权限）
   */
  async createRegistrationField(data: CreateRegistrationFieldRequest): Promise<RegistrationField> {
    const response = await this.axios.post<RegistrationField>('/admin/registration-fields', data)
    return response.data
  }

  /**
   * 更新注册字段配置（需要超级管理员权限）
   */
  async updateRegistrationField(id: string, data: UpdateRegistrationFieldRequest): Promise<RegistrationField> {
    const response = await this.axios.put<RegistrationField>(`/admin/registration-fields/${id}`, data)
    return response.data
  }

  /**
   * 删除注册字段（需要超级管理员权限）
   */
  async deleteRegistrationField(id: string): Promise<{ message: string }> {
    const response = await this.axios.delete<{ message: string }>(`/admin/registration-fields/${id}`)
    return response.data
  }

  /**
   * 批量更新字段顺序（需要超级管理员权限）
   */
  async updateFieldOrder(fields: { id: string; order: number }[]): Promise<{ message: string }> {
    const response = await this.axios.put<{ message: string }>('/admin/registration-fields/order', { fields })
    return response.data
  }

  /**
   * 获取激活的注册字段（用于注册页面）
   */
  async getActiveFields(): Promise<RegistrationField[]> {
    const response = await this.axios.get<RegistrationField[]>('/registration-fields/active')
    return response.data
  }
}

// 创建单例
const registrationFieldsApi = new RegistrationFieldsApi()

export default registrationFieldsApi