import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
})

export const registrationSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符').max(50, '密码不能超过50个字符'),
  confirmPassword: z.string().min(6, '请确认密码'),
  phone: z.string().min(11, '请输入有效的手机号码'),
  major: z.string().min(1, '请选择专业'),
  grade: z.string().min(1, '请选择年级'),
  experience: z.string().optional(),
  motivation: z.string().min(10, '申请理由至少需要10个字符'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegistrationFormData = z.infer<typeof registrationSchema>