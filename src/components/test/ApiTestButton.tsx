"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useErrorHandler } from '@/hooks/use-error-handler'
import axiosService from '@/lib/axios'

export function ApiTestButton() {
  const { showError } = useErrorHandler()
  
  const testApiError = async () => {
    try {
      // 故意调用一个不存在的API端点来测试404错误
      await axiosService.get('/nonexistent-endpoint')
    } catch (error) {
      console.log('手动捕获到错误:', error)
      showError(error, '测试API错误')
    }
  }
  
  const testUnauthorized = async () => {
    try {
      // 清除令牌然后尝试访问需要认证的端点
      localStorage.removeItem('access_token')
      await axiosService.get('/users/profile')
    } catch (error) {
      console.log('401错误测试:', error)
    }
  }
  
  return (
    <div className="p-4 space-y-2">
      <h3 className="font-bold">API错误处理测试</h3>
      <Button onClick={testApiError} variant="outline" className="mr-2">
        测试API错误 (404)
      </Button>
      <Button onClick={testUnauthorized} variant="outline">
        测试未授权错误 (401)
      </Button>
    </div>
  )
}