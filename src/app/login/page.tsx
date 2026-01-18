'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md md:max-w-lg w-full">
        <Card className="backdrop-blur-sm bg-white/70">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">招新管理系统登录</CardTitle>
            <CardDescription>使用您的账号登录系统</CardDescription>
          </CardHeader>
          <CardContent>
            {loginMutation.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  登录失败，请检查您的邮箱和密码
                </AlertDescription>
              </Alert>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
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
                  <Label htmlFor="password">密码</Label>
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
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}