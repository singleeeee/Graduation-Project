'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMenuItems } from '@/hooks/use-permissions'
import { useMyApplications } from '@/hooks/use-applications'
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import type { ApplicationListItem, ApplicationStatus } from '@/lib/api'

interface User {
  id: string | null
  name: string | null
  email: string | null
  role: string | {
    id: string
    name: string
    code: string
    permissions: string[]
  } | null
  permissions?: string[]
}

interface CandidateDashboardProps {
  user: User
  logout: () => void
  overrideContent?: React.ReactNode
  menuItems?: Array<{
    title: string
    icon: LucideIcon
    href: string
    current: boolean
  }>
}

// 状态配置
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft:                { label: '草稿',     color: 'text-gray-500',   badgeVariant: 'outline' },
  submitted:            { label: '已提交',   color: 'text-blue-600',   badgeVariant: 'secondary' },
  screening:            { label: '筛选中',   color: 'text-yellow-600', badgeVariant: 'secondary' },
  rejected:             { label: '未通过',   color: 'text-red-600',    badgeVariant: 'destructive' },
  interview_scheduled:  { label: '已安排面试', color: 'text-purple-600', badgeVariant: 'secondary' },
  interview_completed:  { label: '面试完成', color: 'text-green-600',  badgeVariant: 'default' },
  offer_sent:           { label: '已发Offer', color: 'text-green-600', badgeVariant: 'default' },
  accepted:             { label: '已接受',   color: 'text-green-600',  badgeVariant: 'default' },
  declined:             { label: '已拒绝',   color: 'text-gray-500',   badgeVariant: 'outline' },
  archived:             { label: '已归档',   color: 'text-gray-400',   badgeVariant: 'outline' },
}

// 申请进度步骤定义（按流程顺序）
const PROGRESS_STEPS: Array<{
  key: ApplicationStatus[]   // 哪些状态算"到达"此步骤
  label: string
  doneLabel: string
}> = [
  { key: ['submitted', 'screening', 'rejected', 'interview_scheduled', 'interview_completed', 'offer_sent', 'accepted', 'declined', 'archived'], label: '提交申请',   doneLabel: '已提交' },
  { key: ['screening', 'rejected', 'interview_scheduled', 'interview_completed', 'offer_sent', 'accepted', 'declined', 'archived'],              label: '资料筛选',   doneLabel: '已完成' },
  { key: ['interview_scheduled', 'interview_completed', 'offer_sent', 'accepted', 'declined', 'archived'],                                                  label: '面试环节',   doneLabel: '已完成' },
  { key: ['offer_sent', 'accepted', 'declined', 'archived'],                                                                                                label: '最终结果',   doneLabel: '已出结果' },
]

function getStepState(stepKeys: ApplicationStatus[], currentStatus: ApplicationStatus): 'done' | 'active' | 'pending' {
  if (stepKeys.includes(currentStatus)) return 'done'
  // 判断当前状态是否"在此步骤之前"
  const allDoneStatuses = new Set(stepKeys)
  if (allDoneStatuses.has(currentStatus)) return 'done'
  // 找到当前步骤的前一步是否已完成
  const stepIndex = PROGRESS_STEPS.findIndex(s => s.key === stepKeys)
  if (stepIndex > 0) {
    const prevStep = PROGRESS_STEPS[stepIndex - 1]
    if (prevStep.key.includes(currentStatus)) return 'active'
  }
  return 'pending'
}

// 格式化相对时间
function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 仪表盘主内容
function DashboardContent({ user }: { user: User }) {
  const { data, isLoading } = useMyApplications({ limit: 5 })
  const applications = data?.applications ?? []

  // 取最近一条非草稿申请作为"当前申请"
  const latest = applications.find(a => a.status !== 'draft') ?? applications[0] ?? null

  const statusCfg = latest ? STATUS_CONFIG[latest.status] ?? STATUS_CONFIG.submitted : null

  // 统计数据
  const total = data?.pagination?.total ?? applications.length
  const activeCount = applications.filter(a => !['rejected', 'declined', 'archived', 'draft'].includes(a.status)).length
  const passedCount = applications.filter(a => ['interview_scheduled', 'interview_completed', 'offer_sent', 'accepted'].includes(a.status)).length

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          欢迎回来，{user.name || '候选人'}！
        </h1>
        <p className="mt-2 text-gray-600">管理您的申请和查看最新进展</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">当前状态</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
            ) : latest && statusCfg ? (
              <Badge variant={statusCfg.badgeVariant} className={statusCfg.color}>
                {statusCfg.label}
              </Badge>
            ) : (
              <span className="text-sm text-gray-400">暂无申请</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">申请社团</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
            ) : latest ? (
              <div className="text-lg font-bold truncate" title={latest.recruitment?.club?.name}>
                {latest.recruitment?.club?.name ?? '—'}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-300">—</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最近提交</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            ) : latest?.submittedAt ? (
              <div className="text-2xl font-bold">{formatRelativeTime(latest.submittedAt)}</div>
            ) : latest?.createdAt ? (
              <div className="text-2xl font-bold">{formatRelativeTime(latest.createdAt)}</div>
            ) : (
              <div className="text-2xl font-bold text-gray-300">—</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">申请总数</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-100 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-bold">{total}</div>
            )}
            {!isLoading && passedCount > 0 && (
              <p className="text-xs text-green-600 mt-1">{passedCount} 条通过筛选</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 申请进度 */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>申请进度</CardTitle>
          {latest && (
            <Link href={`/applications/${latest.id}`}>
              <Button variant="ghost" size="sm" className="text-blue-600">查看详情 →</Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : !latest ? (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-4">暂无申请记录</p>
              <Link href="/recruitment">
                <Button size="sm">去浏览招新</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {PROGRESS_STEPS.map((step, idx) => {
                const state = getStepState(step.key, latest.status)
                const isDone = state === 'done'
                const isActive = state === 'active' || (idx === 0 && step.key.includes(latest.status))
                // 第一步：只要不是 draft 就算完成
                const firstStepDone = idx === 0 && latest.status !== 'draft'
                const finalDone = firstStepDone || isDone

                return (
                  <div key={idx} className="flex items-center">
                    {finalDone ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      </div>
                    )}
                    <div className="ml-4 flex-1">
                      <p className={`text-sm font-medium ${!finalDone && !isActive ? 'text-muted-foreground' : ''}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {finalDone
                          ? step.doneLabel
                          : isActive
                            ? '进行中...'
                            : '待定'}
                      </p>
                    </div>
                    <Badge variant={finalDone ? 'default' : isActive ? 'secondary' : 'outline'}>
                      {finalDone ? step.doneLabel : isActive ? '进行中' : '等待中'}
                    </Badge>
                  </div>
                )
              })}

              {/* 被拒绝时额外提示 */}
              {(latest.status === 'rejected' || latest.status === 'declined') && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-600">
                  很遗憾，本次申请未通过。你可以继续浏览其他招新机会。
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 最近申请列表 */}
      {!isLoading && applications.length > 1 && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近申请</CardTitle>
            <Link href="/applications">
              <Button variant="ghost" size="sm" className="text-blue-600">查看全部 →</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.slice(0, 4).map(app => {
                const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.submitted
                return (
                  <Link key={app.id} href={`/applications/${app.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.recruitment?.title ?? '未知招新'}</p>
                        <p className="text-xs text-gray-500 truncate">{app.recruitment?.club?.name ?? '未知社团'}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <span className="text-xs text-gray-400">{formatRelativeTime(app.updatedAt)}</span>
                        <Badge variant={cfg.badgeVariant} className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/recruitment">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <span className="text-2xl">🔍</span>
                <span>浏览招新</span>
              </Button>
            </Link>
            <Link href="/applications">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <span className="text-2xl">📋</span>
                <span>我的申请</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <span className="text-2xl">👤</span>
                <span>个人资料</span>
              </Button>
            </Link>
            <Link href="/resume">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2" variant="outline">
                <span className="text-2xl">📄</span>
                <span>我的简历</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export function CandidateDashboard({ 
  user, 
  logout, 
  overrideContent, 
  menuItems: propsMenuItems 
}: CandidateDashboardProps) {
  const pathname = usePathname()
  const dynamicMenuItems = useMenuItems(pathname || '/')
  const menuItems = propsMenuItems || dynamicMenuItems

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      menuItems={menuItems}
      title="候选人中心"
      theme="candidate"
    >
      <div className="max-w-7xl mx-auto">
        {overrideContent ? (
          <>{overrideContent}</>
        ) : (
          <DashboardContent user={user} />
        )}
      </div>
    </DashboardLayout>
  )
}
