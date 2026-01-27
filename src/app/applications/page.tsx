import React from 'react'
import Link from 'next/link'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CandidateLayout } from '@/components/layout/CandidateLayout'

export default function ApplicationsPage() {
  // TODO: 实现获取申请列表的逻辑
  const applications = [] // 暂时为空

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
      default:
        return {
          label: '未知',
          icon: Clock,
          color: 'text-gray-600'
        }
    }
  }

  return (
    <CandidateLayout 
      title="我的申请"
      subtitle="查看和管理你的社团申请"
      showStats={false}
    >
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
                      <CardTitle>{application.recruitment.title}</CardTitle>
                      <CardDescription>
                        {application.recruitment.club.name}
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
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    查看详情
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </CandidateLayout>
  )
}