'use client'

import { useState } from 'react'
import { useApplications } from '@/hooks/use-applications'
import { usePermissions } from '@/hooks/use-permissions'
import { useQueryClient } from '@tanstack/react-query'
import { useRegistrationFields } from '@/hooks/use-registration-fields'
import { useRecruitments } from '@/hooks/use-recruitment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye, 
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { ApplicationStatus } from '@/lib/api/applications/types'

/**
 * 简历筛选页面(表格版)
 * 管理员可以高效地管理和评估大量申请者简历
 */
export default function ResumeScreeningPage() {
  const { hasPermission } = usePermissions()
  
  // 筛选状态
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as ApplicationStatus | 'all',
    recruitmentId: '',
    clubId: 'all', // 社团ID筛选
    minScore: '',
    maxScore: '',
    grade: '',
    major: '',
    skills: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  // 获取注册字段配置
  const { data: allRegistrationFields = [], isLoading: isFieldsLoading } = useRegistrationFields()

  // 获取招新列表用于建立动态字段映射
  const { data: recruitmentsData } = useRecruitments()

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [bulkActionStatus, setBulkActionStatus] = useState<ApplicationStatus | ''>('')

  const queryClient = useQueryClient()

  // 获取申请列表
  const { data, isLoading, error } = useApplications({
    status: filters.status !== 'all' ? filters.status : undefined,
    recruitmentId: filters.recruitmentId || undefined,
    clubId: filters.clubId !== 'all' ? filters.clubId || undefined : undefined, // 添加社团筛选
    page: 1,
    limit: 100 // 增加每页显示数量以适配表格
  })

  const applications = data?.applications || []

  // 过滤和排序逻辑
  const filteredApplications = applications.filter(app => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const nameMatch = app.applicant?.name?.toLowerCase().includes(searchLower)
      const emailMatch = app.applicant?.email?.toLowerCase().includes(searchLower)
      const studentIdMatch = app.applicant?.studentId?.toLowerCase().includes(searchLower)
      if (!nameMatch && !emailMatch && !studentIdMatch) {
        return false
      }
    }
    if (filters.minScore && app.aiScore && app.aiScore < parseFloat(filters.minScore)) {
      return false
    }
    if (filters.maxScore && app.aiScore && app.aiScore > parseFloat(filters.maxScore)) {
      return false
    }
    if (filters.major && app.education?.major && !app.education.major.toLowerCase().includes(filters.major.toLowerCase())) {
      return false
    }
    if (filters.grade && app.education?.grade && app.education.grade !== filters.grade) {
      return false
    }
    return true
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1
    switch (filters.sortBy) {
      case 'score':
        return ((a.aiScore || 0) > (b.aiScore || 0) ? order : -order) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'name':
        return (a.applicant?.name?.localeCompare(b.applicant?.name || '') || 0) * order
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // 处理选中项变更
  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  // 处理全选
  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === filteredApplications.length 
        ? [] 
        : filteredApplications.map(app => app.id)
    )
  }

  // 批量状态更新(模拟)
  const handleBulkStatusUpdate = async () => {
    if (!bulkActionStatus || selectedApplications.length === 0) return
    
    console.log(`批量更新 ${selectedApplications.length} 个申请状态为: ${bulkActionStatus}`)
    // 模拟API调用
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setSelectedApplications([])
      setBulkActionStatus('')
    }, 1000)
  }

  // 状态标签样式
  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig: Record<ApplicationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string; icon: LucideIcon }> = {
      submitted: { label: '待筛选', variant: 'secondary' as const, color: 'text-gray-600', icon: Clock },
      screening: { label: '筛选中', variant: 'default' as const, color: 'text-blue-600', icon: Star },
      passed: { label: '通过筛选', variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
      rejected: { label: '已拒绝', variant: 'destructive' as const, color: 'text-red-600', icon: XCircle },
      interview_scheduled: { label: '已安排面试', variant: 'default' as const, color: 'text-purple-600', icon: Clock },
      interview_completed: { label: '面试完成', variant: 'secondary' as const, color: 'text-yellow-600', icon: CheckCircle },
      offer_sent: { label: '已发offer', variant: 'default' as const, color: 'text-indigo-600', icon: CheckCircle },
      accepted: { label: '已接受', variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
      declined: { label: '已拒绝', variant: 'destructive' as const, color: 'text-red-600', icon: XCircle },
      archived: { label: '已归档', variant: 'secondary' as const, color: 'text-gray-500', icon: XCircle },
      draft: { label: '草稿', variant: 'secondary' as const, color: 'text-gray-500', icon: Clock }
    }
    return statusConfig[status]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">{error.message || '加载失败，请稍后重试'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">简历筛选</h1>
          <p className="mt-2 text-gray-600">管理和评估所有申请者简历 - 共 {filteredApplications.length} 个申请</p>
        </div>
        
        {/* 导出按钮 */}
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选工具栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            {/* 基础搜索 */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索申请人姓名、学号或邮箱..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              {/* 基础筛选 */}
              <div className="flex gap-2 flex-wrap">
                <Select value={filters.clubId} onValueChange={(value) => setFilters(prev => ({ ...prev, clubId: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="选择社团" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部社团</SelectItem>
                    {/* 动态生成社团选项 */}
                     {recruitmentsData?.data?.map((rec: any) => (
                       <SelectItem key={rec.club.id} value={rec.club.id}>
                         {rec.club.name}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as ApplicationStatus | 'all' }))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="submitted">待筛选</SelectItem>
                    <SelectItem value="screening">筛选中</SelectItem>
                    <SelectItem value="passed">通过</SelectItem>
                    <SelectItem value="rejected">拒绝</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  高级筛选
                  {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 高级筛选面板 */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI评分范围</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="最低分"
                      value={filters.minScore}
                      onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="最高分"
                      value={filters.maxScore}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxScore: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                  <Select value={filters.grade} onValueChange={(value) => setFilters(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="大一">大一</SelectItem>
                      <SelectItem value="大二">大二</SelectItem>
                      <SelectItem value="大三">大三</SelectItem>
                      <SelectItem value="大四">大四</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">专业</label>
                  <Input
                    placeholder="输入专业名称"
                    value={filters.major}
                    onChange={(e) => setFilters(prev => ({ ...prev, major: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">技能标签</label>
                  <Input
                    placeholder="输入技能关键词"
                    value={filters.skills}
                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">最新创建</SelectItem>
                      <SelectItem value="score">AI评分</SelectItem>
                      <SelectItem value="name">姓名</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* 批量操作工具栏 */}
        {selectedApplications.length > 0 && (
          <CardContent className="border-t pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">已选择 {selectedApplications.length} / {filteredApplications.length} 个申请</span>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Select value={bulkActionStatus} onValueChange={(value) => setBulkActionStatus(value as ApplicationStatus)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="批量操作" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passed">批量通过</SelectItem>
                    <SelectItem value="rejected">批量拒绝</SelectItem>
                    <SelectItem value="screening">开始筛选</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleBulkStatusUpdate} disabled={!bulkActionStatus} size="sm">
                  应用操作
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedApplications([])}
                >
                  清空选择
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 申请列表 - 表格形式 */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[200px]">申请人</TableHead>
                  <TableHead className="hidden md:table-cell">学号</TableHead>
                  <TableHead className="hidden lg:table-cell">学院/专业</TableHead>
                  <TableHead className="hidden xl:table-cell">年级</TableHead>
                  <TableHead className="hidden xl:table-cell">招新项目</TableHead>
                  <TableHead className="text-center">AI评分</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>暂无申请数据</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => {
                    const statusInfo = getStatusBadge(application.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <TableRow key={application.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox 
                            checked={selectedApplications.includes(application.id)}
                            onCheckedChange={() => handleSelectApplication(application.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-sm font-semibold">{application.applicant?.name || '未知'}</div>
                            <div className="text-xs text-gray-500">{application.applicant?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {application.applicant?.studentId || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          <div>
                            {application.education?.major && (
                              <div className="text-sm">{application.education.major}</div>
                            )}
                            {application.education?.college && (
                              <div className="text-xs text-gray-500">{application.education.college}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          {application.education?.grade || '-'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          <div className="max-w-[150px] truncate" title={application.recruitment?.title}>
                            {application.recruitment?.title || '未知招新'}
                          </div>
                          <div className="text-xs text-gray-500">{application.recruitment?.club?.name}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          {application.aiScore ? (
                            <Badge variant="default" className={`${application.aiScore >= 80 ? 'bg-green-100 text-green-800' : application.aiScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {application.aiScore.toFixed(1)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">未评分</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className={`flex items-center gap-1 ${statusInfo.color} w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            <span className="hidden lg:inline">{statusInfo.label}</span>
                            <span className="lg:hidden">
                              {statusInfo.label.replace('筛选', '').replace('已', '').replace('面试', '面')}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/applications/${application.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">详情</span>
                              </Button>
                            </Link>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSelectApplication(application.id)}>
                                  {selectedApplications.includes(application.id) ? '取消选择' : '选择'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Star className="mr-2 h-4 w-4" />
                                  开始筛选
                                </DropdownMenuItem>
                                {application.status === 'submitted' && (
                                  <>
                                    <DropdownMenuItem onClick={() => {/* 通过逻辑 */}}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      快速通过
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {/* 拒绝逻辑 */}}>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      快速拒绝
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 表格底部统计信息 */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-2">
        <div>
          显示 {filteredApplications.length} 条记录
          {filters.search && ` (从 ${applications.length} 条中筛选)`}
        </div>
        <div className="flex gap-4 text-xs">
          <span>待筛选: <span className="font-semibold">{applications.filter(app => app.status === 'submitted').length}</span></span>
          <span>筛选中: <span className="font-semibold text-blue-600">{applications.filter(app => app.status === 'screening').length}</span></span>
          <span>已通过: <span className="font-semibold text-green-600">{applications.filter(app => app.status === 'passed').length}</span></span>
          <span>已拒绝: <span className="font-semibold text-red-600">{applications.filter(app => app.status === 'rejected').length}</span></span>
        </div>
      </div>
    </div>
  )
}