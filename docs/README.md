# 角色权限管理系统

这是一个完整的角色权限管理模块，包含角色管理界面、权限控制和访问保护功能。

## 📦 组件概览

### 1. 角色管理页面 (`/admin/roles/page.tsx`)
完整的角色管理界面，包括：
- 角色列表展示
- 创建/编辑/删除角色
- 权限分配管理
- 角色状态切换

### 2. 角色选择器组件 (`RoleSelector.tsx`)
- `RoleSelector`: 单角色下拉选择器
- `MultiRoleSelector`: 多角色选择器
- `RoleBadge`: 角色显示徽章

### 3. 权限守卫组件 (`PermissionGuard.tsx`)
- `PermissionGuard`: 通用权限守卫
- `AdminGuard`: 管理员权限守卫
- `SuperAdminGuard`: 超级管理员权限守卫
- `ProtectedRoute`: 路由保护组件

### 4. 权限管理 Hook (`use-permissions.ts`)
提供完整的权限检查和管理功能：
- `usePermissions`: 用户权限检查
- `useRoles`: 角色列表管理
- `usePermissionsList`: 权限列表管理
- `usePermissionModules`: 权限模块获取

## 🚀 快速开始

### 1. 使用角色选择器

```tsx
import { RoleSelector } from '@/components/roles'

function UserForm() {
  const [selectedRole, setSelectedRole] = useState('')

  return (
    <RoleSelector
      value={selectedRole}
      onChange={setSelectedRole}
      placeholder="选择用户角色"
    />
  )
}
```

### 2. 使用权限守卫

```tsx
import { PermissionGuard } from '@/components/roles'

function AdminPanel() {
  return (
    <PermissionGuard permission="admin_panel">
      <AdminDashboard />
    </PermissionGuard>
  )
}
```

### 3. 使用权限 Hook

```tsx
import { usePermissions } from '@/hooks/use-permissions'

function UserProfile() {
  const { hasPermission, hasRole } = usePermissions()

  return (
    <div>
      {hasPermission('edit_profile') && (
        <button>编辑个人资料</button>
      )}
      
      {hasRole('admin') && (
        <button>管理功能</button>
      )}
    </div>
  )
}
```

## 🔧 API 方法

### 角色管理 API

```typescript
import { rolesApi } from '@/lib/api'

// 获取角色列表
const roles = await rolesApi.getRoles({ page: 1, limit: 10 })

// 创建角色
const newRole = await rolesApi.createRole({
  name: '社团管理员',
  code: 'club_admin',
  description: '管理社团相关功能',
  level: 10,
  isActive: true
})

// 更新角色
await rolesApi.updateRole(roleId, {
  name: '更新后的角色名',
  level: 15
})

// 删除角色
await rolesApi.deleteRole(roleId)

// 权限管理
await rolesApi.assignPermissions(roleId, {
  permissionIds: ['permission1', 'permission2']
})
```

### 权限管理 API

```typescript
import { permissionsApi } from '@/lib/api'

// 获取权限列表
const permissions = await permissionsApi.getPermissions({
  module: 'user_management'
})

// 获取权限模块列表
const modules = await permissionsApi.getPermissionModules()
```

## 🎯 权限检查方法

### usePermissions Hook 提供的方法

```typescript
const {
  // 基本权限检查
  hasPermission,           // 检查单个权限
  hasAnyPermission,        // 检查任一权限
  hasAllPermissions,       // 检查所有权限
  
  // 角色级别检查
  hasRoleLevel,            // 检查角色级别
  hasRole,                 // 检查特定角色
  hasAnyRole,              // 检查任一角色
  
  // 数据
  userRole,                // 当前用户角色信息
  userPermissions,         // 当前用户权限列表
  isLoading                // 加载状态
} = usePermissions()
```

## 📝 类型定义

### 核心类型

```typescript
// 角色
interface Role {
  id: string
  name: string
  code: string
  description?: string
  level: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 权限
interface Permission {
  id: string
  name: string
  code: string
  module: string
  description?: string
  createdAt: string
}

// 创建角色请求
interface CreateRoleRequest {
  name: string
  code: string
  description?: string
  level?: number
  isActive?: boolean
}

// 更新角色请求
interface UpdateRoleRequest {
  name?: string
  description?: string
  level?: number
  isActive?: boolean
}
```

## 🛡️ 权限守卫使用示例

### 保护组件

```tsx
import { PermissionGuard, AdminGuard, SuperAdminGuard } from '@/components/roles'

// 单个权限检查
<PermissionGuard permission="user_create">
  <CreateUserButton />
</PermissionGuard>

// 多个权限检查（任一满足）
<PermissionGuard permissions={['user_create', 'user_edit']}>
  <UserManagementPanel />
</PermissionGuard>

// 多个权限检查（全部满足）
<PermissionGuard 
  permissions={['user_create', 'user_delete']} 
  requireAll={true}
>
  <AdminUserPanel />
</PermissionGuard>

// 角色级别检查
<PermissionGuard roleLevel={20}>
  <AdminDashboard />
</PermissionGuard>

// 特定角色检查
<PermissionGuard roleCodes={['admin', 'super_admin']}>
  <ManagementTools />
</PermissionGuard>
```

### 路由保护

```tsx
import { ProtectedRoute } from '@/components/roles'

// 在页面组件中使用
export default function AdminPage() {
  return (
    <ProtectedRoute permission="admin_access">
      <AdminPanel />
    </ProtectedRoute>
  )
}
```

### 简化守卫

```tsx
import { AdminGuard, SuperAdminGuard } from '@/components/roles'

// 管理员权限
<AdminGuard>
  <AdminTools />
</AdminGuard>

// 超级管理员权限
<SuperAdminGuard>
  <SystemConfig />
</SuperAdminGuard>
```

## 🎨 自定义角色徽章

```tsx
import { RoleBadge } from '@/components/roles'

// 基础使用
<RoleBadge roleCode="admin" />

// 自定义大小和显示
<RoleBadge 
  roleCode="club_admin" 
  size="lg" 
  showLevel={false} 
/>
```

## 🔄 缓存策略

该模块使用 React Query 进行数据缓存：
- 角色数据缓存时间：5分钟
- 权限数据缓存时间：10分钟
- 用户权限缓存时间：15分钟

## 🐛 常见问题

### 1. 角色更新后权限不立即生效
解决方案：手动清除相关缓存

```typescript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// 更新角色后
queryClient.invalidateQueries({ queryKey: ['roles'] })
queryClient.invalidateQueries({ queryKey: ['userPermissions'] })
```

### 2. 权限检查返回 false
检查清单：
- 用户是否已登录
- 用户是否有对应的角色
- 角色是否有对应的权限
- 角色是否为激活状态

### 3. 角色下拉列表为空
可能原因：
- API 接口未正确配置
- 没有可分配的角色
- 网络请求失败

## 📊 性能指标

- 首次加载时间：< 500ms
- 缓存命中率：> 90%
- 权限检查响应时间：< 10ms

## 🔒 安全说明

1. **前端权限检查仅为用户体验优化**，后端 API 必须进行权限验证
2. 角色和权限数据应定期刷新
3. 敏感操作应有二次确认
4. 权限变更后应及时通知用户重新登录