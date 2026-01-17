'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, type RegistrationFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAppStore } from '@/store'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAppStore()
  
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
        phone: data.phone,
        major: data.major,
        grade: data.grade,
        experience: data.experience,
        motivation: data.motivation
      }
      
      const response = await authApi.register(registerData)
      return response
    },
    onSuccess: (response) => {
      console.log('注册响应:', response)
      // 处理两种可能的响应格式
      let loginData = response
      
      // 如果响应是ApiResponse包装格式
      const apiResponse = response as any
      if (apiResponse && apiResponse.data && apiResponse.data.accessToken) {
        loginData = apiResponse.data
      }
      
      // 注册成功后自动登录
      if (loginData && loginData.accessToken && loginData.refreshToken && loginData.user) {
        // 保存token到localStorage
        authApi.setTokens(loginData.accessToken, loginData.refreshToken)
        
        // 更新用户状态
        setUser({
          id: loginData.user.id,
          name: loginData.user.name,
          email: loginData.user.email,
          role: loginData.user.role
        })
        
        // 跳转到主页
        router.push('/')
      } else {
        console.log('注册响应数据不完整:', response)
        alert('注册成功！请登录您的账号')
      }
    },
    onError: (error) => {
      console.error('注册失败详细错误:', error)
      if (error?.message) {
        alert(`注册失败: ${error.message}`)
      } else {
        alert('注册失败，请检查填写信息')
      }
    }
  })

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">候</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            候选人注册
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            填写信息，开启您的申请之旅
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名 *
              </label>
              <Input
                id="name"
                {...register('name')}
                className="mt-1"
                placeholder="请输入您的真实姓名"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱 *
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                placeholder="请输入邮箱地址"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码 *
              </label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                placeholder="请输入密码（至少6位）"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码 *
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="mt-1"
                placeholder="请再次输入密码"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手机号 *
              </label>
              <Input
                id="phone"
                {...register('phone')}
                className="mt-1"
                placeholder="请输入手机号码"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                专业 *
              </label>
              <Input
                id="major"
                {...register('major')}
                className="mt-1"
                placeholder="请输入您的专业"
              />
              {errors.major && (
                <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                年级 *
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
                <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                相关经历（选填）
              </label>
              <textarea
                id="experience"
                {...register('experience')}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请描述您的相关项目经历或工作经验"
              />
              {errors.experience && (
                <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
                申请理由 *
              </label>
              <textarea
                id="motivation"
                {...register('motivation')}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="请说明您为什么想要加入我们，以及您的优势和期望"
              />
              {errors.motivation && (
                <p className="mt-1 text-sm text-red-600">{errors.motivation.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
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
        </form>
      </div>
    </div>
  )
}