'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAppStore } from '@/store'
import { useState } from 'react'
import { DynamicRegistrationForm } from '@/components/auth/DynamicRegistrationForm'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAppStore()
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      // 分离基础字段和动态字段
      const { confirmPassword, ...profileFields } = data
      
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        profileFields
      }
      
      const response = await authApi.register(registerData)
      return response
    },
    onSuccess: (response) => {
      let loginData = response
      
      const apiResponse = response as any
      if (apiResponse.data && apiResponse.success !== undefined) {
        loginData = apiResponse.data
      }

      if (loginData.user) {
        setUser(loginData.user)
        if (loginData.accessToken) {
          localStorage.setItem('access_token', loginData.accessToken)
        }
        toast.success('注册成功！即将跳转...')
        setShowSuccessAlert(true)
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        toast.error('注册失败', { description: '用户数据不完整，请重试' })
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || '注册失败，请重试'
      toast.error('注册失败', { description: message })
    }
  })

  const onSubmit = (data: any) => {
    registerMutation.mutate(data)
  }

  return (
    <div className="min-h-screen w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md md:max-w-lg w-full">
        <Card className="backdrop-blur-sm bg-white/70">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-3xl">候</span>
            </div>
            <CardTitle className="text-3xl font-bold">候选人注册</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              填写信息，开启您的申请之旅
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicRegistrationForm 
              onSubmit={(data) => onSubmit(data)}
              isSubmitting={registerMutation.isPending}
            />
            
            <div className="mt-6 space-y-4">
              <Button
                type="submit"
                form="dynamic-register-form"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? '注册中...' : '立即注册'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  已有账号？{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    立即登录
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}