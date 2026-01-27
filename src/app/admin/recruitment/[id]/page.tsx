"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, MoreHorizontal, CalendarIcon, Clock, User, Trash2, Edit, Eye, EyeOff, Pause, Play, CheckCircle, Archive } from 'lucide-react'
import { useRecruitment, useUpdateRecruitmentStatus, useDeleteRecruitment, useClubsForSelection, useRegistrationFieldsForSelection } from '@/hooks/use-recruitment'
import { usersApi } from '@/lib/api'
import { RecruitmentStatus } from '@/lib/api/recruitment/types'
import { FormPreview } from '@/components/recruitment/FormPreview'

// 招新状态配置
const statusConfig: Record<RecruitmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<any> }> = {
  draft: { label: '草稿', variant: 'secondary', icon: Edit },
  published: { label: '已发布', variant: 'default', icon: CheckCircle },
  ongoing: { label: '进行中', variant: 'default', icon: Clock },
  finished: { label: '已结束', variant: 'outline', icon: CheckCircle },
  archived: { label: '已存档', variant: 'secondary', icon: Archive },
}

export default function RecruitmentDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // 获取招新详情
  const { data: recruitment, isLoading, error, refetch } = useRecruitment(id)
  // 获取社团和字段配置用于 Form Preview
  const { data: clubs } = useClubsForSelection()
  const { data: allFields } = useRegistrationFieldsForSelection()

  // 获取当前社团信息
  const currentClub = clubs?.find(club => club.id === recruitment?.clubId)
  
  // 获取管理员信息
  const { data: adminUser } = useQuery({
    queryKey: ['user', recruitment?.adminId],
    queryFn: async () => {
      if (!recruitment?.adminId) return null
      try {
        const user = await usersApi.getUserById(recruitment.adminId)
        return user
      } catch (error) {
        console.warn('Failed to fetch admin user info:', error)
        return null
      }
    },
    enabled: !!recruitment?.adminId,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })

  // 筛选出招新批次所需字段的详细信息
  const requiredFieldsDetails = allFields?.filter(field => 
    recruitment?.requiredFields?.includes(field.id)
  )

  // 状态变更和删除的重置 Hook，用于操作成功后刷新数据或跳转
  const updateStatusMutation = useUpdateRecruitmentStatus()
  const deleteRecruitmentMutation = useDeleteRecruitment()

  // 渲染状态徽章
  const StatusBadge = ({ status }: { status: RecruitmentStatus }) => {
    const config = statusConfig[status]
    
    // 安全处理：如果状态配置不存在，显示默认状态
    if (!config) {
      console.warn(`Unknown recruitment status: ${status}`)
      return (
        <Badge variant="secondary" className="gap-1">
          {String(status)}
        </Badge>
      )
    }
    
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-4 w-4" />
        {config.label}
      </Badge>
    )
  }

  // 处理状态变更，添加成功/失败反馈
  const handleStatusChange = async (newStatus: RecruitmentStatus) => {
    if (!recruitment) return
    
    try {
      await updateStatusMutation.mutateAsync({ 
        id: recruitment.id, 
        data: { status: newStatus } 
      })
      toast.success(`状态更新成功！当前状态：${statusConfig[newStatus].label}`)
      refetch() // 更新页面数据
    } catch (error) {
      console.error('更新状态失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      toast.error(`更新状态失败，请重试。 ${errorMessage}`)
    }
  }

  // 处理删除，添加成功/失败反馈
  const handleDelete = async () => {
    try {
      await deleteRecruitmentMutation.mutateAsync(recruitment!.id)
      toast.success('招新批次删除成功！')
      setDeleteDialogOpen(false)
      router.replace('/admin/recruitment')
    } catch (error) {
      console.error('删除失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      toast.error(`删除失败，请重试。 ${errorMessage}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !recruitment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">加载失败或招新不存在</p>
          <Button onClick={() => router.push('/admin/recruitment')} className="mt-2">
            返回列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{recruitment.title}</h1>
          <p className="text-gray-500">
            所属社团: {currentClub?.name || '未知社团'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={recruitment.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">更多操作</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recruitment.status === 'draft' && (
                <DropdownMenuItem onClick={() => handleStatusChange(RecruitmentStatus.PUBLISHED)}>
                  <Play className="mr-2 h-4 w-4" />
                  发布
                </DropdownMenuItem>
              )}
              {(recruitment.status === 'published' || recruitment.status === 'draft') && (
                <DropdownMenuItem onClick={() => handleStatusChange(RecruitmentStatus.ONGOING)}>
                  <Play className="mr-2 h-4 w-4" />
                  开始招新
                </DropdownMenuItem>
              )}
              {recruitment.status === 'ongoing' && (
                <DropdownMenuItem onClick={() => handleStatusChange(RecruitmentStatus.PUBLISHED)}>
                  <Pause className="mr-2 h-4 w-4" />
                  暂停招新
                </DropdownMenuItem>
              )}
              {recruitment.status !== 'finished' && recruitment.status !== 'archived' && (
                <DropdownMenuItem onClick={() => handleStatusChange(RecruitmentStatus.FINISHED)}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  结束招新
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/admin/recruitment/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 基本信息 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">描述</h3>
              <p className="text-gray-600">{recruitment.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> 开始时间</h3>
                <p className="text-gray-600">
                  {recruitment.startTime ? new Date(recruitment.startTime).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未设置'}
                </p>
              </div>
              <div>
                <h3 className="font-medium flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> 结束时间</h3>
                <p className="text-gray-600">
                  {recruitment.endTime ? new Date(recruitment.endTime).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未设置'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium flex items-center"><User className="mr-2 h-4 w-4" /> 管理员</h3>
              <p className="text-gray-600">
                {adminUser ? adminUser.name : recruitment.adminId}
                {adminUser && adminUser.email && (
                  <span className="text-sm text-gray-500 ml-2">({adminUser.email})</span>
                )}
              </p>
            </div>
              {/* TODO: 当Zustand store的updateRecruitmentStatus完成时，移除此显示 */}
              {recruitment.status === 'draft' && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">注意：</strong>
                <span className="block sm:inline">此招新批次当前状态为草稿，发布后将允许候选人申请。</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <Card>
          <CardHeader>
            <CardTitle>统计信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 占位数据，实际应根据 API 返回 */}
              <div>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-gray-500">总申请数</p>
              </div>
              <div>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-gray-500">已通过</p>
              </div>
              <div>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-gray-500">待面试</p>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link href={`/admin/applications?recruitmentId=${id}`}>
                查看申请管理
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 申请表单预览 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>申请字段预览</CardTitle>
          <CardDescription>
            候选人将看到并填写这些字段进行申请。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormPreview fields={requiredFieldsDetails || []} />
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除招新批次 "{recruitment.title}" 吗？
              此操作无法撤销，相关联的申请数据也将受到影响。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}