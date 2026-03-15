"use client"

import React from 'react'
import Link from 'next/link'
import { Calendar, Users, Clock, Building2, ArrowRight, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RecruitmentBatch } from '@/lib/api/recruitment/types'

interface RecruitmentCardProps {
  recruitment: RecruitmentBatch
}

// 分类对应的渐变色
const CATEGORY_GRADIENTS: Record<string, string> = {
  '学术科技': 'from-blue-500 to-indigo-600',
  '文化艺术': 'from-pink-500 to-rose-600',
  '体育竞技': 'from-green-500 to-emerald-600',
  '创新创业': 'from-orange-500 to-amber-600',
  '公益志愿': 'from-teal-500 to-cyan-600',
  '综合': 'from-purple-500 to-violet-600',
}

const DEFAULT_GRADIENT = 'from-slate-500 to-gray-600'

// 用社团名生成固定渐变（无分类时）
function getGradientByName(name: string): string {
  const gradients = Object.values(CATEGORY_GRADIENTS)
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
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

  const isApplicationOpen =
    (recruitment.status === 'published' || recruitment.status === 'ongoing') &&
    new Date(recruitment.endTime) > new Date()

  const daysLeft = Math.ceil(
    (new Date(recruitment.endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const fillRate = recruitment.maxApplicants > 0
    ? Math.round((recruitment.applicationCount / recruitment.maxApplicants) * 100)
    : 0

  const isHot = fillRate >= 60 || recruitment.applicationCount >= 10

  const gradient =
    CATEGORY_GRADIENTS[DEFAULT_GRADIENT] ??
    getGradientByName(recruitment.club.name)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'published':
        return { label: '已发布', className: 'bg-blue-100 text-blue-700 border-blue-200' }
      case 'ongoing':
        return { label: '招新中', className: 'bg-green-100 text-green-700 border-green-200' }
      case 'draft':
        return { label: '草稿', className: 'bg-gray-100 text-gray-600 border-gray-200' }
      case 'finished':
        return { label: '已结束', className: 'bg-red-100 text-red-600 border-red-200' }
      case 'archived':
        return { label: '已存档', className: 'bg-slate-100 text-slate-500 border-slate-200' }
      default:
        return { label: '未知', className: 'bg-gray-100 text-gray-500 border-gray-200' }
    }
  }

  const statusInfo = getStatusInfo(recruitment.status)
  const clubInitial = recruitment.club.name.charAt(0)

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* 顶部渐变色块 */}
      <div className={`relative h-24 bg-gradient-to-br ${getGradientByName(recruitment.club.name)} flex items-end px-5 pb-0`}>
        {/* 装饰圆 */}
        <div className="absolute top-3 right-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute top-8 right-10 w-8 h-8 rounded-full bg-white/10" />

        {/* 热门标签 */}
        {isHot && (
          <div className="absolute top-3 left-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
            <Flame className="h-3 w-3" />
            热门
          </div>
        )}

        {/* 社团头像 */}
        <div className="relative translate-y-1/2 z-10">
          <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-lg font-bold text-gray-700">
            {clubInitial}
          </div>
        </div>

        {/* 状态 badge */}
        <div className="absolute top-3 right-4">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex flex-col flex-1 px-5 pt-8 pb-5 gap-3">
        {/* 社团名 */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{recruitment.club.name}</span>
        </div>

        {/* 标题 */}
        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {recruitment.title}
        </h3>

        {/* 描述 */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
          {recruitment.description}
        </p>

        {/* 时间和人数 */}
        <div className="space-y-2 text-sm text-gray-500 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <span>{formatDate(recruitment.startTime)} — {formatDate(recruitment.endTime)}</span>
          </div>

          {/* 进度条 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <span>
                  {recruitment.applicationCount} / {recruitment.maxApplicants} 人
                </span>
              </div>
              <span className={`text-xs font-medium ${fillRate >= 80 ? 'text-red-500' : fillRate >= 50 ? 'text-orange-500' : 'text-gray-400'}`}>
                {fillRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  fillRate >= 80 ? 'bg-red-400' : fillRate >= 50 ? 'bg-orange-400' : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min(fillRate, 100)}%` }}
              />
            </div>
          </div>

          {/* 倒计时 */}
          {isApplicationOpen && daysLeft <= 7 && (
            <div className="flex items-center gap-2 text-orange-500 font-medium">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>仅剩 {daysLeft} 天截止</span>
            </div>
          )}
          {isApplicationOpen && daysLeft > 7 && (
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>距截止还有 {daysLeft} 天</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="pt-1">
          {isApplicationOpen ? (
            <Link href={`/applications/new?recruitmentId=${recruitment.id}`} className="w-full block">
              <Button className="w-full gap-2 group/btn" size="sm">
                立即申请
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="w-full" size="sm" disabled>
              {recruitment.status === 'finished' || recruitment.status === 'archived'
                ? '招新已结束'
                : '招新尚未开始'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
