'use client'

import { useMyApplications } from '@/hooks/use-applications'
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ApplicationsPage() {
  // 使用Hook获取我的申请列表
  const { data, isLoading, isError, error } = useMyApplications()
  
  // FIX: Handle the proper data structure from API
  const applications = data?.applications || []
  
  // 调试日志
  console.log('Applications data:', data)
  console.log('Applications loading:', isLoading)
  console.log('Applications error:', error)
  console.log('Applications length:', applications.length)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          label: '已提交',
          icon: Clock,
          color: 'text-blue-600'
        }
      case 'screening':
        return {
          label: '筛选中',
          icon: AlertCircle,
          color: 'text-yellow-600'
        }
      case 'passed':
        return {
          label: '通过',
          icon: CheckCircle,
          color: 'text-green-600'
        }
      case 'rejected':
        return {
          label: '未通过',
          icon: XCircle,
          color: 'text-red-600'
        }
      case 'interview_scheduled':
        return {
          label: '已安排面试',
          icon: Clock,
          color: 'text-purple-600'
        }
      case 'interview_completed':
        return {
          label: '面试完成',
          icon: CheckCircle,
          color: 'text-green-600'
        }
      case 'offer_sent':
        return {
          label: '已发Offer',
          icon: CheckCircle,
          color: 'text-green-600'
        }
      case 'accepted':
        return {
          label: '已接受',
          icon: CheckCircle,
          color: 'text-green-600'
        }
      case 'declined':
        return {
          label: '已拒绝',
          icon: XCircle,
          color: 'text-gray-600'
        }
      default:
        return {
          label: '未知',
          icon: Clock,
          color: 'text-gray-600'
        }
    }
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载申请列表...</span>
        </div>
      </div>
    )
  }

  // 错误状态
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>加载失败</CardTitle>
            <CardDescription>
              无法获取申请列表，请刷新页面重试
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/recruitment">
            <Button>浏览新招新</Button>
          </Link>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>暂无申请记录</CardTitle>
            <CardDescription>
              你还没有提交任何社团申请
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/recruitment">
              <Button>开始申请</Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => {
            const statusInfo = getStatusInfo(application.status)
            const StatusIcon = statusInfo.icon
            
            return (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{application.recruitment?.title || '未知招新'}</CardTitle>
                      <CardDescription>
                        {application.recruitment?.club?.name || '未知社团'}
                      </CardDescription>
                    </div>
                    <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                      <StatusIcon className="h-5 w-5" />
                      <span className="font-medium">{statusInfo.label}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>申请时间: {new Date(application.createdAt).toLocaleString('zh-CN')}</p>
                    <p>最后更新: {new Date(application.updatedAt).toLocaleString('zh-CN')}</p>
                    {application.submittedAt && (
                      <p>提交时间: {new Date(application.submittedAt).toLocaleString('zh-CN')}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/applications/${application.id}`}>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}