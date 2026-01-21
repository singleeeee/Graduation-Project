'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store'
import { Search, Filter, Edit, Trash2, Eye, Users, Crown, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { usersApi } from '@/lib/api'
import type { UserProfile, UserListParams } from '@/lib/api/users'

interface UserFilters {
  role: string
  status: string
  search: string
}

interface UserManagementPageProps {
  user: {
    id: string | null
    name: string | null
    email: string | null
    role: string | {
      id: string
      name: string
      code: string
      level: number
      permissions: string[]
    } | null
    permissions?: string[]
  }
  logout: () => void
}

function UserManagementPageContent({ user, logout }: UserManagementPageProps) {
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    statusReason: ''
  })
  
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // 查询参数
  const queryParams: UserListParams = {
    page: currentPage,
    limit: pageSize,
    role: filters.role === 'all' ? undefined : filters.role as any,
    search: filters.search || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }

  // 获取用户列表
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => usersApi.getUsers(queryParams),
    enabled: true,
  })

  // 更新用户状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' | 'suspended' }) =>
      usersApi.updateUserStatus(id, status),
    onSuccess: () => {
      toast({ title: '成功', description: '用户状态更新成功' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error?.response?.data?.message || '更新用户状态失败',
        variant: 'destructive'
      })
    },
  })

  // 编辑用户
  const editUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.updateUser(id, data),
    onSuccess: () => {
      toast({ title: '成功', description: '用户信息更新成功' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error?.response?.data?.message || '更新用户信息失败',
        variant: 'destructive'
      })
    },
  })

  // 删除用户
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      toast({ title: '成功', description: '用户删除成功' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error?.response?.data?.message || '删除用户失败',
        variant: 'destructive'
      })
    },
  })


  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleStatusUpdate = (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    updateStatusMutation.mutate({ id: userId, status })
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id)
    }
  }

  const handleOpenEditDialog = (user: UserProfile) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name || '',
      email: user.email,
      status: user.status,
      statusReason: ''
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = () => {
    if (selectedUser) {
      // Extract user role code if it's an object
      const userRoleCode = typeof selectedUser.role === 'object' && selectedUser.role?.code 
        ? selectedUser.role.code 
        : selectedUser.role

      // Build request data according to the new UpdateUserRequest interface
      const requestData: any = {
        name: editFormData.name,
        status: editFormData.status,
        statusReason: editFormData.statusReason || undefined
      }

      // Only include email if it has changed and validate it
      if (editFormData.email && editFormData.email !== selectedUser.email) {
        requestData.email = editFormData.email
      }

      // Include roleCode if user has a role but not for system_admin as per API rules
      if (userRoleCode && userRoleCode !== 'system_admin') {
        requestData.roleCode = userRoleCode
      }

      // Include profileFields from selectedUser if available
      if (selectedUser.profileFields && Object.keys(selectedUser.profileFields).length > 0) {
        requestData.profileFields = selectedUser.profileFields
      }

      // Include avatar if user has one
      if (selectedUser.avatar) {
        requestData.avatar = selectedUser.avatar
      }

      editUserMutation.mutate({
        id: selectedUser.id,
        data: requestData
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string | any) => {
    // 如果是对象，使用code属性
    const roleCode = typeof role === 'object' && role?.code ? role.code : role
    switch (roleCode) {
      case 'system_admin':
        return 'bg-purple-100 text-purple-800'
      case 'club_admin':
        return 'bg-blue-100 text-blue-800'  
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'candidate':
        return 'bg-green-100 text-green-800'
      case 'interviewer':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRole = (role: string | any) => {
    // 如果是对象，使用code属性或name属性
    const roleCode = typeof role === 'object' && role ? (role.code || role.name || '') : role
    switch (roleCode) {
      case 'system_admin':
      case 'admin':
        return '超级管理员'
      case 'club_admin':
        return '社团管理员'
      case 'candidate':
        return '候选人' 
      case 'interviewer':
        return '面试官'
      default:
        return typeof role === 'object' && role?.name ? role.name : roleCode
    }
  }

  const totalPages = usersData ? Math.ceil(usersData.total / pageSize) : 0

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">加载用户数据失败</div>
        <Button onClick={() => window.location.reload()}>重新加载</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的所有用户账号</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold">{usersData?.total || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">激活用户</p>
                <p className="text-2xl font-bold">
                  {usersData?.users?.filter(u => u.status === 'active').length || 0}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-5 w-5 bg-green-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">管理员</p>
                <p className="text-2xl font-bold">
                  {usersData?.users?.filter(u => {
                    const roleCode = typeof u.role === 'object' && u.role?.code ? u.role.code : u.role
                    return roleCode === 'admin' || roleCode === 'system_admin' || roleCode === 'super_admin'
                  }).length || 0}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">候选人</p>
                  <p className="text-2xl font-bold">
                    {usersData?.users?.filter(u => {
                      const roleCode = typeof u.role === 'object' && u.role?.code ? u.role.code : u.role
                      return roleCode === 'candidate'
                    }).length || 0}
                  </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选和搜索</CardTitle>
          <CardDescription>按角色、状态搜索用户</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户名、邮箱、学号..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.role}
              onValueChange={(value) => handleFilterChange('role', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="system_admin">超级管理员</SelectItem>
                <SelectItem value="club_admin">社团管理员</SelectItem>
                <SelectItem value="candidate">候选人</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="suspended">已暂停</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            共 {usersData?.total || 0} 个用户，第 {currentPage} 页，共 {totalPages} 页
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户信息</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : usersData && usersData?.users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      暂无用户数据
                    </TableCell>
                  </TableRow>
                ) : (
                  (usersData?.users ?? []).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name || '用户头像'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium">
                              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{user.name || '未设置姓名'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.studentId && (
                              <div className="text-xs text-gray-400">学号: {user.studentId}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                显示 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, usersData?.total || 0)} 条，共 {usersData?.total || 0} 条
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                    } else {
                      pageNum = i + 1
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 查看用户详情对话框 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>
              查看用户的详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {selectedUser.avatar ? (
                  <img 
                    src={selectedUser.avatar} 
                    alt={selectedUser.name || '用户头像'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl font-medium">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name || '未设置姓名'}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex space-x-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {formatRole(selectedUser.role)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">用户ID</label>
                  <p className="mt-1 text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">注册时间</label>
                  <p className="mt-1 text-sm">{new Date(selectedUser.createdAt).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">最后更新</label>
                  <p className="mt-1 text-sm">{new Date(selectedUser.updatedAt).toLocaleString('zh-CN')}</p>
                </div>
                {selectedUser.studentId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">学号</label>
                    <p className="mt-1 text-sm">{selectedUser.studentId}</p>
                  </div>
                )}
                {selectedUser.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">手机号</label>
                    <p className="mt-1 text-sm">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.major && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">专业</label>
                    <p className="mt-1 text-sm">{selectedUser.major}</p>
                  </div>
                )}
                {selectedUser.grade && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">年级</label>
                    <p className="mt-1 text-sm">{selectedUser.grade}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsViewDialogOpen(false)}>关闭</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户的基本信息和状态
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="请输入邮箱"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                      setEditFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">激活</SelectItem>
                      <SelectItem value="inactive">未激活</SelectItem>
                      <SelectItem value="suspended">已暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">状态修改原因</label>
                  <Textarea
                    value={editFormData.statusReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditFormData(prev => ({ ...prev, statusReason: e.target.value }))}
                    placeholder="请输入状态修改的原因（可选）"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={editUserMutation.isPending}
            >
              {editUserMutation.isPending ? '保存中...' : '保存更改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
            <DialogDescription>
              您确定要删除用户 "{selectedUser?.name || selectedUser?.email || ''}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setSelectedUser(null)
              }}
            >
              取消
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute permission="user_view">
      <UserManagementPageContent
        user={{ id: 'admin-1', name: '超级管理员', email: 'admin@example.com', role: 'system_admin' }}
        logout={async () => {
          try {
            const { logout: logoutStore } = useAppStore.getState()
            await logoutStore()
            window.location.href = '/login'
          } catch (error) {
            console.error('退出登录失败:', error)
            window.location.href = '/login'
          }
        }}
      />
    </ProtectedRoute>
  )
}