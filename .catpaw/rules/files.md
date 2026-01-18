---
name: "招新系统文件组织规范"
description: "Next.js 项目的文件目录结构、组件组织、命名规范和代码结构标准，指导团队协作开发"
ruleType: "Model Request"
---

# 高校社团智能化在线招新系统 - 文件组织规则

## 📁 目录结构规范

### 核心目录说明

#### `src/app/` - Next.js App Router 页面结构
```
└── app/
    ├── (auth)/                           # 认证相关页面组（无布局嵌套）
    │   ├── login/
    │   │   └── page.tsx                    # 登录页面
    │   └── register/
    │       └── page.tsx                 # 注册页面
    │
    ├── (dashboard)/                      # 仪表盘页面组
    │   ├── candidate/                    # 候选人仪表盘
    │   │   └── page.tsx
    │   └── admin/                       # 管理员仪表盘
    │       └── page.tsx
    │
    ├── admin/                           # 管理员功能模块
    │   ├── layout.tsx                    # 管理员布局
    │   ├── users/                       # 用户管理
    │   │   └── page.tsx
    │   ├── recruitment/                 # 招新管理
    │   │   └── page.tsx
    │   └── applications/               # 申请管理
    │       └── page.tsx
    │
    ├── applications/                   # 申请相关页面
    │   ├── page.tsx                    # 申请列表
    │   └── [id]/                       # 动态申请详情页
    │       └── page.tsx
    │
    ├── profile/                        # 个人资料页面
    │   └── page.tsx
    │
    ├── interviews/                    # 面试相关页面
    │   └── page.tsx
    │
    ├── layout.tsx                     # 根布局组件
    ├── page.tsx                       # 首页（智能路由分发）
    └── globals.css                    # 全局样式
```

#### `src/components/` - React 组件组织
```
└── components/
    ├── ui/                           # shadcn/ui 基础组件
    │   ├── button.tsx
    │   ├── card.tsx
    │   └── ...
    │
    ├── auth/                        # 认证相关组件
    │   ├── LoginForm.tsx
    │   ├── RegisterForm.tsx
    │   └── AuthGuard.tsx
    │
    ├── dashboard/                   # 仪表盘组件
    │   ├── AdminDashboard.tsx
    │   ├── CandidateDashboard.tsx
    │   ├── StatsCard.tsx
    │   └── QuickActions.tsx
    │
    ├── layout/                     # 布局组件
    │   ├── DashboardLayout.tsx
    │   ├── Sidebar.tsx
    │   └── Header.tsx
    │
    ├── recruitment/                # 招新相关组件
    │   ├── RecruitmentList.tsx
    │   ├── RecruitmentCard.tsx
    │   └── CreateRecruitmentForm.tsx
    │
    ├── applications/               # 申请相关组件
    │   ├── ApplicationForm.tsx
    │   ├── ApplicationList.tsx
    │   └── ApplicationStatus.tsx
    │
    ├── interview/                  # 面试相关组件
    │   ├── InterviewSchedule.tsx
    │   ├── InterviewEvaluation.tsx
    │   └── InterviewRoom.tsx
    │
    └── common/                     # 通用组件
        ├── LoadingSpinner.tsx
        ├── ErrorBoundary.tsx
        └── EmptyState.tsx
```

#### `src/lib/` - 核心工具和 API 封装
```
└── lib/
    ├── api/                        # API 客户端封装
    │   ├── index.ts               # API 统一导出
    │   ├── auth.ts                # 认证相关 API
    │   ├── users.ts               # 用户管理 API
    │   ├── recruitment.ts         # 招新管理 API
    │   ├── applications.ts        # 申请管理 API
    │   └── __tests__/            # API 测试文件
    │       └── auth.test.ts
    │
    ├── axios.ts                  # Axios 封装和配置
    ├── auth.ts                   # 认证工具函数
    ├── validations.ts            # 数据验证规则 (Zod schemas)
    ├── query-client.tsx          # React Query 配置
    ├── utils.ts                  # 通用工具函数
    └── constants.ts              # 常量定义
```

#### `src/store/` - Zustand 状态管理
```
└── store/
    ├── index.ts                 # 全局状态入口
    ├── auth.ts                  # 认证状态管理
    ├── recruitment.ts           # 招新状态管理
    └── applications.ts          # 申请状态管理
```

#### `src/hooks/` - 自定义 Hooks
```
└── hooks/
    ├── use-auth.ts             # 认证相关 Hook
    ├── use-permissions.ts      # 权限控制 Hook
    ├── use-recruitment.ts      # 招新相关 Hook
    ├── use-applications.ts     # 申请相关 Hook
    ├── use-interviews.ts       # 面试相关 Hook
    └── use-api.ts              # 通用 API Hook
```

#### `src/types/` - TypeScript 类型定义
```
└── types/
    ├── index.ts                # 类型统一导出
    ├── auth.ts                 # 认证相关类型
    ├── user.ts                 # 用户相关类型
    ├── recruitment.ts          # 招新相关类型
    ├── application.ts          # 申请相关类型
    ├── interview.ts            # 面试相关类型
    └── api.ts                  # API 响应类型
```

## 📄 文件命名规范

### 组件文件命名
- **功能组件**: `PascalCase.tsx` （如 `UserProfile.tsx`）
- **页面组件**: `page.tsx` （Next.js App Router 约定）
- **布局组件**: `layout.tsx` （Next.js App Router 约定）
- **UI组件**: 遵循 shadcn/ui 命名（如 `button.tsx`, `card.tsx`）

### 工具文件命名
- **API 文件**: `{module}.ts` （如 `auth.ts`, `users.ts`）
- **Hooks**: `use-{functionality}.ts` （如 `use-auth.ts`）
- **配置文件**: `{purpose}.{ext}` （如 `query-client.tsx`）
- **类型定义**: `{domain}.ts` （如 `user.ts`, `recruitment.ts`）

### 目录命名
- **功能模块**: 使用单数或复数形式，保持一致性
- **页面组**: 使用括号包裹 `(group-name)` 避免布局嵌套
- **动态路由**: 使用方括号 `[param]` 定义动态段

## 🏗️ 文件内容结构规范

### React 组件文件结构
```typescript
// 1. 导入依赖
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

// 2. 类型定义
interface ComponentProps {
  userId: string
  onSuccess?: () => void
}

interface UserData {
  id: string
  name: string
  email: string
}

// 3. 组件主体
export function ComponentName({ userId, onSuccess }: ComponentProps) {
  // 4. 状态管理
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  
  // 5. 副作用
  useEffect(() => {
    fetchUserData()
  }, [userId])
  
  // 6. 事件处理函数
  const fetchUserData = async () => {
    setLoading(true)
    try {
      const data = await usersApi.getUserById(userId)
      setUserData(data)
    } catch (error) {
      console.error('获取用户数据失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAction = async () => {
    // 业务逻辑
    onSuccess?.()
  }
  
  // 7. 渲染逻辑
  if (loading) {
    return <div>加载中...</div>
  }
  
  return (
    <div className="component-container">
      {/* JSX 内容 */}
    </div>
  )
}
```

### API 文件结构
```typescript
// src/lib/api/users.ts
import axiosService from '../axios'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'candidate' | 'interviewer'
  // ... 其他字段
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  avatar?: string
}

class UsersApi {
  private axios = axiosService
  
  async getProfile(): Promise<UserProfile> {
    const response = await this.axios.get<UserProfile>('/users/profile')
    return response.data
  }
  
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await this.axios.put<UserProfile>('/users/profile', data)
    return response.data
  }
  
  // ... 其他方法
}

export const usersApi = new UsersApi()
```

### Hook 文件结构
```typescript
// src/hooks/use-auth.ts
import { useAppStore } from '@/store'
import { authApi } from '@/lib/api'

export function useAuth() {
  const { user, isAuthenticated, logout } = useAppStore()
  
  const login = async (email: string, password: string) => {
    try {
      const userProfile = await authApi.login({ email, password })
      // 处理登录成功逻辑
      return userProfile
    } catch (error) {
      // 处理登录失败逻辑
      throw error
    }
  }
  
  const hasRole = (role: string): boolean => {
    return user?.role === role
  }
  
  const hasPermission = (permission: string): boolean => {
    // 权限检查逻辑
    return true
  }
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasPermission
  }
}
```

## 📚 导入导出规范

### 导入顺序
```typescript
// 1. React 相关
import React, { useState } from 'react'
import { useRouter } from 'next/router'

// 2. 第三方库
import { Button } from '@headlessui/react'
import { format } from 'date-fns'

// 3. shadcn/ui 组件
import { Button as UIButton } from '@/components/ui/button'

// 4. 本地组件
import { Header } from '@/components/layout/Header'

// 5. 工具和 Hook
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'

// 6. 类型定义
import { UserProfile } from '@/types/user'
```

### 导出规范
- **默认导出**: 主要组件或类
- **命名导出**: 工具函数、常量、类型
- **Barrel exports**: 在 `index.ts` 中统一导出模块

```typescript
// src/types/index.ts
export * from './auth'
export * from './user'
export * from './recruitment'
export * from './application'
```

## 🔧 配置文件规范

### `package.json` 依赖分组
```json
{
  "dependencies": {
    "next": "latest",                    // 框架核心
    "react": "latest",                   // React 核心
    "@tanstack/react-query": "latest",   // 数据获取
    "zustand": "latest",                 // 状态管理
    "react-hook-form": "latest",         // 表单处理
    "@hookform/resolvers": "latest",     // 表单验证
    "zod": "latest"                      // 数据验证
  },
  "devDependencies": {
    "@types/node": "latest",            // TypeScript 支持
    "@types/react": "latest",           // React TypeScript 支持
    "tailwindcss": "latest",            // CSS 框架
    "typescript": "latest"              // TypeScript
  }
}
```

## 🎨 样式文件规范

### CSS 文件组织
- `globals.css`: 全局样式和 Tailwind 指令
- `themes/`: 主题相关样式（如果需要多主题支持）
- 组件样式: 使用 CSS Modules 或 Tailwind 类名


## 📝 文档文件规范

### README.md 结构
```markdown
# 项目名称

## 项目简介
- 一句话描述项目目的
- 核心功能特性

## 技术栈
- 列出主要技术

## 快速开始
安装、运行、构建命令

## 项目结构
- 主要目录说明

## 开发规范
- 代码风格
- 提交规范

## 贡献指南
- Fork、分支、PR 流程
```

## 🧪 测试文件规范

### 测试文件命名
- `*.test.ts` - 单元测试
- `*.spec.ts` - 集成测试
- `*.e2e.ts` - 端到端测试

### 测试文件位置
```
lib/
├── api/
│   ├── users.ts
│   └── __tests__/
│       └── users.test.ts
└── __tests__/
    └── utils.test.ts
```

## 🔐 环境配置规范

### `.env` 文件
```
# .env.local - 本地开发环境
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Recruitment System

# 敏感配置（不上传 Git）
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## 📋 文件更新和维护

### 版本控制
- **提交规范**: 遵循 Conventional Commits
- **分支策略**: main(生产), develop(开发), feature/*(功能)
- **代码审查**: 重要文件需要团队审查

### 文档更新
- **接口变更**: 及时更新类型定义和文档
- **功能新增**: 更新相关文档和示例
- **Bug修复**: 记录问题原因和解决方案

---

*此文件规范用于指导项目开发过程中的文件组织和内容结构，确保代码的可维护性和团队协作效率。*
