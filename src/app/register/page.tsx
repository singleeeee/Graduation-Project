'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, type RegistrationFormData } from '@/lib/utils/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAppStore } from '@/store'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAppStore()
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        profileFields: {
          phone: data.phone,
          major: data.major,
          grade: data.grade,
          experience: data.experience,
          motivation: data.motivation
        }
      }
      
      const response = await authApi.register(registerData)
      return response
    },
    onSuccess: (response) => {
      console.log('注册响应:', response)
      let loginData = response
      
      const apiResponse = response as any
      if (apiResponse.data && apiResponse.success !== undefined) {
        loginData = apiResponse.data
      }

      if (loginData.user) {
        setUser(loginData.user)
        if (loginData.accessToken) {
          localStorage.setItem('token', loginData.accessToken)
        }
        setShowSuccessAlert(true)
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        console.error('注册成功但用户数据不完整:', loginData)
      }
    },
    onError: (error) => {
      console.error('注册失败详细错误:', error)
    }
  })

  const onSubmit = (data: RegistrationFormData) => {
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  <span>姓名</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  className="mt-1"
                  placeholder="请输入您的真实姓名"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  <span>邮箱</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-1"
                  placeholder="请输入邮箱地址"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  <span>密码</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="mt-1"
                  placeholder="请输入密码，至少6位"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  <span>确认密码</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="mt-1"
                  placeholder="请再次输入密码"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  <span>手机号</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="mt-1"
                  placeholder="请输入手机号"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                  <span>专业</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <Input
                  id="major"
                  {...register('major')}
                  className="mt-1"
                  placeholder="请输入您的专业"
                />
                {errors.major && (
                  <p className="mt-1 text-sm text-destructive">{errors.major.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                  <span>年级</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <select
                  id="grade"
                  {...register('grade')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">请选择年级</option>
                  <option value="大一">大一</option>
                  <option value="大二">大二</option>
                  <option value="大三">大三</option>
                  <option value="大四">大四</option>
                  <option value="研一">研一</option>
                  <option value="研二">研二</option>
                  <option value="研三">研三</option>
                </select>
                {errors.grade && (
                  <p className="mt-1 text-sm text-destructive">{errors.grade.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  <span>相关经历</span>
                  <span className="text-gray-500 ml-1 text-xs">（选填）</span>
                </label>
                <textarea
                  id="experience"
                  {...register('experience')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请描述您的相关项目经历或工作经验"
                />
                {errors.experience && (
                  <p className="mt-1 text-sm text-destructive">{errors.experience.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
                  <span>申请理由</span>
                  <span className="text-red-500 ml-1" aria-label="必填">*</span>
                </label>
                <textarea
                  id="motivation"
                  {...register('motivation')}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请说明您为什么想要加入我们，以及您的优势和期望"
                />
                {errors.motivation && (
                  <p className="mt-1 text-sm text-destructive">{errors.motivation.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}