'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { registrationFieldsApi } from '@/lib/api'
import type { 
  RegistrationField, 
  CreateRegistrationFieldRequest, 
  UpdateRegistrationFieldRequest 
} from '@/lib/api/registration-fields'

interface RegistrationFieldsPageProps {
  user: {
    id: string | null
    name: string | null
    email: string | null
    role: string | null
  }
  logout: () => void
}

// 表单验证模式
const createFieldSchema = z.object({
  fieldName: z.string().min(1, '字段名称不能为空').max(50, '字段名称不能超过50个字符'),
  fieldLabel: z.string().min(1, '显示标签不能为空').max(50, '显示标签不能超过50个字符'),
  fieldType: z.enum(['text', 'email', 'select', 'textarea', 'file', 'date', 'number']),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.string().optional(),
})

function RegistrationFieldsPageContent({ user, logout }: RegistrationFieldsPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<RegistrationField | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // 获取注册字段列表
  const { data: fields = [], isLoading, error } = useQuery({
    queryKey: ['registrationFields'],
    queryFn: () => registrationFieldsApi.getRegistrationFields(),
    enabled: true,
  })

  // 创建字段表单
  const createForm = useForm<CreateRegistrationFieldRequest>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      fieldOrder: fields.length,
      isRequired: false,
      isActive: true,
      placeholder: '',
      helpText: '',
    }
  })

  // 编辑字段表单
  const editForm = useForm<UpdateRegistrationFieldRequest>({
    resolver: zodResolver(createFieldSchema.partial()),
    defaultValues: {
      fieldLabel: '',
      fieldType: 'text',
      isRequired: false,
      isActive: true,
      placeholder: '',
      helpText: '',
    }
  })

  // 创建字段
  const createFieldMutation = useMutation({
    mutationFn: (data: CreateRegistrationFieldRequest) => {
      const processedData = {
        ...data,
        fieldOrder: fields.length,
        options: data.fieldType === 'select' && data.options 
          ? JSON.parse((data.options as unknown) as string) 
          : undefined
      }
      return registrationFieldsApi.createRegistrationField(processedData)
    },
    onSuccess: () => {
      toast({ title: '成功', description: '注册字段创建成功' })
      queryClient.invalidateQueries({ queryKey: ['registrationFields'] })
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error?.response?.data?.message || '创建字段失败',
        variant: 'destructive'
      })
    },
  })

  // 更新字段
  const updateFieldMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegistrationFieldRequest }) => {
      const processedData = {
        ...data,
        options: data.fieldType === 'select' && data.options 
          ? JSON.parse((data.options as unknown) as string) 
          : data.options
      }
      return registrationFieldsApi.updateRegistrationField(id, processedData)
    },
    onSuccess: () => {
      toast({ title: '成功', description: '注册字段更新成功' })
      queryClient.invalidateQueries({ queryKey: ['registrationFields'] })
      setIsEditDialogOpen(false)
      setSelectedField(null)
      editForm.reset()
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error?.response?.data?.message || '更新字段失败',
        variant: 'destructive'
      })
    },
  })

  // 删除字段
  const deleteFieldMutation = useMutation({
    mutationFn: (id: string) => registrationFieldsApi.deleteRegistrationField(id),
    onSuccess: () => {
      toast({ title: '成功', description: '注册字段删除成功' })
      queryClient.invalidateQueries({ queryKey: ['registrationFields'] })
      setIsDeleteDialogOpen(false)
      setSelectedField(null)
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error?.response?.data?.message || '删除字段失败',
        variant: 'destructive'
      })
    },
  })

  // 更新字段顺序
  const updateOrderMutation = useMutation({
    mutationFn: (fields: { id: string; order: number }[]) => 
      registrationFieldsApi.updateFieldOrder(fields),
    onSuccess: () => {
      toast({ title: '成功', description: '字段顺序更新成功' })
      queryClient.invalidateQueries({ queryKey: ['registrationFields'] })
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error?.response?.data?.message || '更新顺序失败',
        variant: 'destructive'
      })
    },
  })

  const handleCreateField = (data: CreateRegistrationFieldRequest) => {
    createFieldMutation.mutate(data)
  }

  const handleUpdateField = (data: UpdateRegistrationFieldRequest) => {
    if (selectedField) {
      updateFieldMutation.mutate({ id: selectedField.id, data })
    }
  }

  const handleDeleteField = () => {
    if (selectedField) {
      deleteFieldMutation.mutate(selectedField.id)
    }
  }

  const handleEditClick = (field: RegistrationField) => {
    setSelectedField(field)
    editForm.reset({
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      isActive: field.isActive,
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      options: field.options ? JSON.stringify(field.options, null, 2) as any : '',
    })
    setIsEditDialogOpen(true)
  }

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === fields.length - 1)) {
      return
    }

    const newFields = [...fields]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]]
    
    const fieldsWithNewOrder = newFields.map((field, idx) => ({
      id: field.id,
      order: idx
    }))
    
    updateOrderMutation.mutate(fieldsWithNewOrder)
  }

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-100 text-blue-800'
      case 'email':
        return 'bg-green-100 text-green-800'
      case 'select':
        return 'bg-purple-100 text-purple-800'
      case 'textarea':
        return 'bg-yellow-100 text-yellow-800'
      case 'file':
        return 'bg-pink-100 text-pink-800'
      case 'date':
        return 'bg-indigo-100 text-indigo-800'
      case 'number':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFieldType = (type: string) => {
    switch (type) {
      case 'text':
        return '单行文本'
      case 'email':
        return '邮箱'
      case 'select':
        return '下拉选择'
      case 'textarea':
        return '多行文本'
      case 'file':
        return '文件上传'
      case 'date':
        return '日期'
      case 'number':
        return '数字'
      default:
        return type
    }
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">加载注册字段配置失败</div>
        <Button onClick={() => window.location.reload()}>重新加载</Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">注册字段配置</h1>
          <p className="text-gray-600 mt-1">管理用户注册时需要填写的字段</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加字段
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加注册字段</DialogTitle>
              <DialogDescription>
                创建新的用户注册字段，支持多种字段类型和验证规则
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateField)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="fieldName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>字段名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder="如：studentId, phone, major" {...field} />
                        </FormControl>
                        <FormDescription>
                          英文标识，用于后端处理
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="fieldLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>显示标签 *</FormLabel>
                        <FormControl>
                          <Input placeholder="如：学号、手机号、专业" {...field} />
                        </FormControl>
                        <FormDescription>
                          用户看到的字段名称
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="fieldType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>字段类型 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择字段类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">单行文本</SelectItem>
                          <SelectItem value="email">邮箱</SelectItem>
                          <SelectItem value="textarea">多行文本</SelectItem>
                          <SelectItem value="select">下拉选择</SelectItem>
                          <SelectItem value="file">文件上传</SelectItem>
                          <SelectItem value="date">日期</SelectItem>
                          <SelectItem value="number">数字</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        选择合适的数据类型
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {createForm.watch('fieldType') === 'select' && (
                  <FormField
                    control={createForm.control}
                    name="options"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>选项配置</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={`[
  {"value": "option1", "label": "选项1"},
  {"value": "option2", "label": "选项2"}
]`}
                            rows={4}
                            value={(field.value as unknown) as string || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          JSON格式的选项配置
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={createForm.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>占位符文本</FormLabel>
                      <FormControl>
                        <Input placeholder="输入占位符文本" {...field} />
                      </FormControl>
                      <FormDescription>
                        字段为空时显示的提示文本
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>帮助文本</FormLabel>
                      <FormControl>
                        <Textarea placeholder="输入帮助说明" {...field} />
                      </FormControl>
                      <FormDescription>
                        提供给用户的额外说明
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">必填字段</FormLabel>
                          <FormDescription>
                            用户注册时是否必须填写此字段
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">启用字段</FormLabel>
                          <FormDescription>
                            是否在注册表单中显示此字段
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createFieldMutation.isPending}
                  >
                    {createFieldMutation.isPending ? '创建中...' : '创建字段'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 编辑字段对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑注册字段</DialogTitle>
              <DialogDescription>
                修改用户注册字段的配置信息
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateField)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="fieldLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>显示标签</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>字段类型</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">单行文本</SelectItem>
                            <SelectItem value="email">邮箱</SelectItem>
                            <SelectItem value="textarea">多行文本</SelectItem>
                            <SelectItem value="select">下拉选择</SelectItem>
                            <SelectItem value="file">文件上传</SelectItem>
                            <SelectItem value="date">日期</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {editForm.watch('fieldType') === 'select' && (
                  <FormField
                    control={editForm.control}
                    name="options"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>选项配置</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={`[
  {"value": "option1", "label": "选项1"},
  {"value": "option2", "label": "选项2"}
]`}
                            rows={4}
                            value={(field.value as unknown) as string || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={editForm.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>占位符文本</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="helpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>帮助文本</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">必填字段</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">启用字段</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setSelectedField(null)
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateFieldMutation.isPending}
                  >
                    {updateFieldMutation.isPending ? '更新中...' : '更新字段'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除字段</DialogTitle>
              <DialogDescription>
                您确定要删除注册字段 "{selectedField?.fieldLabel}" 吗？此操作将同时删除所有用户的相关数据，且无法撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedField(null)
                }}
              >
                取消
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteField}
                disabled={deleteFieldMutation.isPending}
              >
                {deleteFieldMutation.isPending ? '删除中...' : '确认删除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 字段列表 */}
      <Card>
        <CardHeader>
          <CardTitle>注册字段列表</CardTitle>
          <CardDescription>
            共 {fields.length} 个注册字段，按显示顺序排列
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">顺序</TableHead>
                  <TableHead>字段信息</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>必填</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      暂无注册字段，点击"添加字段"按钮创建第一个字段
                    </TableCell>
                  </TableRow>
                ) : (
                  fields
                    .sort((a, b) => a.fieldOrder - b.fieldOrder)
                    .map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(index, 'up')}
                              disabled={index === 0 || updateOrderMutation.isPending}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(index, 'down')}
                              disabled={index === fields.length - 1 || updateOrderMutation.isPending}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{field.fieldLabel}</div>
                            <div className="text-sm text-gray-500">{field.fieldName}</div>
                            {field.placeholder && (
                              <div className="text-xs text-gray-400">占位符: {field.placeholder}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFieldTypeColor(field.fieldType)}>
                            {formatFieldType(field.fieldType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={field.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {field.isActive ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={field.isRequired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                            {field.isRequired ? '必填' : '选填'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(field.createdAt).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(field)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedField(field)
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
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegistrationFieldsPage() {
  return (
    <ProtectedRoute permission="registration_field_manage">
      <RegistrationFieldsPageContent 
        user={{
          id: 'admin-1',
          name: '超级管理员',
          email: 'admin@example.com',
          role: 'system_admin'
        }}
        logout={() => {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }}
      />
    </ProtectedRoute>
  )
}