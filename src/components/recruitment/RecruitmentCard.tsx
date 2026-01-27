"use client"

import React from 'react'
import Link from 'next/link'
import { Calendar, Users, Clock, Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RecruitmentBatch } from '@/lib/api/recruitment/types'

interface RecruitmentCardProps {
  recruitment: RecruitmentBatch
}

export function RecruitmentCard({ recruitment }: RecruitmentCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    } catch {
      return '日期无效'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
      case 'ongoing':
        return <Badge className="bg-green-500">招新中</Badge>
      case 'draft':
        return <Badge variant="secondary">草稿</Badge>
      case 'finished':
        return <Badge variant="outline">已结束</Badge>
      case 'archived':
        return <Badge variant="ghost">已存档</Badge>
      default:
        return <Badge variant="secondary">未知状态</Badge>
    }
  }

  const isApplicationOpen = 
    (recruitment.status === 'published' || recruitment.status === 'ongoing') && 
    new Date(recruitment.endTime) > new Date()

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
            {recruitment.title}
          </CardTitle>
          {getStatusBadge(recruitment.status)}
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{recruitment.club.name}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {recruitment.description}
        </p>
        
        <div className="space-y-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatDate(recruitment.startTime)} - {formatDate(recruitment.endTime)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>
              已申请 {recruitment.applicationCount || 0} / {recruitment.maxApplicants} 人
            </span>
          </div>
          
          {isApplicationOpen && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">
                距离截止还有 {Math.ceil((new Date(recruitment.endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {isApplicationOpen ? (
          <Link 
            href={`/applications/new?recruitmentId=${recruitment.id}`} 
            className="w-full"
          >
            <Button className="w-full" size="sm">
              立即申请
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="w-full" size="sm" disabled>
            {recruitment.status === 'finished' || recruitment.status === 'archived' 
              ? '招新已结束' 
              : '招新尚未开始'
            }
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}