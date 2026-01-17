'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { setUser } = useAppStore()
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(data)
      // 根据邮箱判断用户角色
      const isAdmin = data.email.includes('admin')
      const isCandidate = data.email.includes('candidate')
      
      if (isAdmin) {
        return {
          id: 'admin-1',
          name: '管理员',
          email: data.email,
          role: 'admin'
        }
      } else if (isCandidate) {
        return {
          id: 'candidate-1',
          name: '李四',
          email: data.email,
          role: 'candidate'
        }
      } else {
        // 默认为候选人
        return {
          id: 'candidate-2',
          name: '王五',
          email: data.email,
          role: 'candidate'
        }
      }
    },
    onSuccess: (userData) => {
      console.log(1)
      setUser(userData)
      router.push('/')
    },
    onError: () => {
      console.log('登录失败，请检查邮箱和密码')
    }
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            招新管理系统登录
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                placeholder="请输入邮箱"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                placeholder="请输入密码"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? '登录中...' : '登录'}
          </Button>
        </form>
      </div>
    </div>
  )
}