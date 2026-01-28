'use client'

import { useApplicationDetail } from '@/hooks/use-applications'
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  // 使用Hook获取申请详情
  const { data: application, isLoading, isError, error } = useApplicationDetail(applicationId)

  // 调试日志
  console.log('Application detail data:', application)
  console.log('Application detail loading:', isLoading)
  console.log('Application detail error:', error)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          label: '已提交',
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'screening':
        return {
          label: '筛选中',
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      case 'passed':
        return {
          label: '通过',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'rejected':
        return {
          label: '未通过',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        }
      case 'interview_scheduled':
        return {
          label: '已安排面试',
          icon: Clock,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        }
      case 'interview_completed':
        return {
          label: '面试完成',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'offer_sent':
        return {
          label: '已发Offer',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'accepted':
        return {
          label: '已接受',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'declined':
        return {
          label: '已拒绝',
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
      default:
        return {
          label: '未知',
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
    }
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载申请详情...</span>
        </div>
      </div>
    )
  }

  // 错误状态
  if (isError || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>加载失败</CardTitle>
            <CardDescription>
              无法获取申请详情，请刷新页面重试
              {error && <p className="text-red-500 mt-2">{error.message}</p>}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.back()}>
              返回
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(application.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">申请详情</h1>
          <p className="text-gray-600">查看申请的详细信息和状态</p>
        </div>
      </div>

      {/* 基本信息卡片 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                {application.recruitment?.title || '未知招新'}
              </CardTitle>
              <CardDescription className="mt-2">
                {application.recruitment?.club?.name || '未知社团'}
              </CardDescription>
            </div>
            <div className={`flex items-center gap-2 ${statusInfo.color} ${statusInfo.bgColor} px-3 py-2 rounded-lg`}>
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">{statusInfo.label}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 申请信息 */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">申请信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">申请ID:</span>
                  <span className="font-mono text-xs">{application.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">申请时间:</span>
                  <span>{new Date(application.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后更新:</span>
                  <span>{new Date(application.updatedAt).toLocaleString('zh-CN')}</span>
                </div>
                {application.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">提交时间:</span>
                    <span>{new Date(application.submittedAt).toLocaleString('zh-CN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 申请人信息 */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">申请人信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">申请人ID:</span>
                  <span className="font-mono text-xs">{application.applicantId}</span>
                </div>
                {application.education && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">姓名:</span>
                      <span>{application.education.name || application.formData?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">学号:</span>
                      <span>{application.education.studentId || application.formData?.studentId || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">电话:</span>
                      <span>{application.education.phone || application.formData?.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">学院:</span>
                      <span>{application.education.college || application.formData?.college || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">专业:</span>
                      <span>{application.education.major || application.formData?.major || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">年级:</span>
                      <span>{application.education.grade || application.formData?.grade || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 申请内容 */}
      {(application.education || application.formData) && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">申请内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(application.education?.experience || application.formData?.experience) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">相关经验</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.education?.experience || application.formData?.experience}</p>
                </div>
              )}
              {(application.education?.motivation || application.formData?.motivation) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">申请动机</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.education?.motivation || application.formData?.motivation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* AI分析结果 */}
      {application.aiScore !== null && application.aiAnalysis && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">AI分析结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">综合评分:</span>
                <Badge variant={application.aiScore >= 80 ? "default" : application.aiScore >= 60 ? "secondary" : "destructive"}>
                  {application.aiScore}/100
                </Badge>
              </div>
              {application.aiAnalysis && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">分析详情</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.aiAnalysis}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 面试信息 */}
      {application.interviews && application.interviews.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">面试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.interviews.map((interview, index) => (
                <div key={interview.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">面试 #{index + 1}</h4>
                      <p className="text-sm text-gray-600">
                        面试时间: {new Date(interview.scheduledTime).toLocaleString('zh-CN')}
                      </p>
                      {interview.interviewer && (
                        <p className="text-sm text-gray-600">
                          面试官: {interview.interviewer.name}
                        </p>
                      )}
                    </div>
                    <Badge variant={interview.status === 'completed' ? 'default' : 'secondary'}>
                      {interview.status === 'completed' ? '已完成' : '待进行'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 状态历史 */}
      {application.statusHistory && application.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">状态历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.statusHistory.map((history) => {
                const historyStatusInfo = getStatusInfo(history.status)
                const HistoryIcon = historyStatusInfo.icon
                
                return (
                  <div key={history.id} className="flex items-start gap-4 border-l-2 border-gray-200 pl-4 pb-4">
                    <div className={`${historyStatusInfo.color} mt-1`}>
                      <HistoryIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{historyStatusInfo.label}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.changedAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        操作人: {history.changedBy.name} ({history.changedBy.role})
                      </div>
                      {history.comment && (
                        <div className="text-sm text-gray-700 mt-1">
                          备注: {history.comment}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}