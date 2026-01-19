'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/utils/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppStore } from '@/store'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { loginAndSetUser } from '@/lib/auth'
import { AlertCircle } from 'lucide-react'

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
      const userData = await loginAndSetUser(data.email, data.password)
      return userData
    },
    onSuccess: (userData) => {
      router.push('/')
    },
    onError: (error) => {
      console.error('登录失败，请检查邮箱和密码:', error)
    }
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md md:max-w-lg w-full">
        <Card className="backdrop-blur-sm bg-white/70">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-3xl">招</span>
            </div>
            <CardTitle className="text-3xl font-bold">招新管理系统登录</CardTitle>
            <CardDescription className="text-gray-600 mt-2">使用您的账号登录系统</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loginMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    登录失败，请检查您的邮箱和密码
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <span>邮箱</span>
                      <span className="text-red-500 ml-1" aria-label="必填">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="请输入邮箱"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      <span>密码</span>
                      <span className="text-red-500 ml-1" aria-label="必填">*</span>
                    </Label>
                    <Input
                      id="password" 
                      type="password"
                      autoComplete="current-password"
                      {...register('password')}
                      placeholder="请输入密码"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? '登录中...' : '登录'}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}