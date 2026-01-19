---
name: "招新系统项目架构规范"
description: "高校社团智能化在线招新系统的整体架构、技术栈选型、核心模块划分和开发规范指南"
ruleType: "Always"
---

# 高校社团智能化在线招新系统 - 项目规则

## 🎯 项目概述

**项目名称**: 高校社团智能化在线招新系统  
**项目版本**: V1.0  
**技术栈**: Next.js 14 + TypeScript + Tailwind CSS + Zustand + React Query  + Radix UI

### 项目目标
- 实现招新全流程在线化（后台管理、候选人投递、面试安排等）
- 通过AI辅助筛选简历并生成个性化题库
- 提供多端兼容的响应式用户体验
- 建立安全可靠的数据管理体系

## 👥 目标用户群体

1. **候选人**：在校学生，浏览社团信息、提交申请、查看进度
2. **社团管理员**：创建招新活动、审核申请、安排面试、发送通知
3. **系统管理员**：用户管理、权限配置、数据维护

## 🏗️ 系统架构规范

### 前端架构
```
┌─────────────────────────────────────────────────────┐
│                    前端层 (Next.js 14)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  候选人端   │  │  管理员端   │  │   响应式    │  │
│  │  (H5/PC)    │  │  (PC)       │  │    布局     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└──────────────────────────┬──────────────────────────┘
```

### 核心模块划分
1. **用户管理模块**：注册登录、角色权限、个人资料
2. **招新管理模块**：招新批次、流程引擎、活动管理  
3. **申请管理模块**：申请提交、状态流转、材料管理
4. **AI辅助决策模块**：简历评分、技能提取、题库生成
5. **面试管理模块**：面试安排、评估记录、题库管理
6. **通知通信模块**：邮件通知、实时通知、消息推送
7. **文件管理模块**：文件上传、格式验证、存储策略

## 📁 项目结构规范

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # 认证相关页面组
│   │   ├── login/                # 登录页面
│   │   └── register/             # 注册页面
│   ├── (dashboard)/              # 仪表盘页面组
│   │   ├── candidate/           # 候选人仪表盘
│   │   └── admin/              # 管理员仪表盘
│   ├── admin/                   # 管理员功能模块
│   │   ├── users/              # 用户管理
│   │   ├── recruitment/        # 招新管理
│   │   └── applications/       # 申请管理
│   ├── applications/            # 申请相关页面
│   ├── profile/                 # 个人资料页面
│   └── page.tsx                 # 首页（智能路由）

├── components/                   # React 组件
│   ├── ui/                      # shadcn/ui 基础组件
│   ├── auth/                    # 认证相关组件
│   ├── dashboard/               # 仪表盘组件
│   │   ├── AdminDashboard.tsx   # 管理员仪表盘
│   │   └── CandidateDashboard.tsx # 候选人仪表盘
│   ├── layout/                  # 布局组件
│   │   └── DashboardLayout.tsx  # 仪表盘布局
│   ├── recruitment/             # 招新相关组件
│   ├── applications/            # 申请相关组件
│   └── interview/              # 面试相关组件

├── lib/                         # 核心工具库
│   ├── api/                    # API 封装层
│   │   ├── auth/              # 认证 API 模块
│   │   │   ├── types.ts        # 认证相关类型定义
│   │   │   └── index.ts        # 认证 API 实现
│   │   ├── users/             # 用户 API 模块
│   │   │   ├── types.ts        # 用户相关类型定义
│   │   │   └── index.ts        # 用户 API 实现
│   │   ├── clubs/             # 社团 API 模块
│   │   │   ├── types.ts        # 社团相关类型定义
│   │   │   └── index.ts        # 社团 API 实现
│   │   ├── registration-fields/ # 注册字段 API 模块
│   │   │   ├── types.ts        # 注册字段类型定义
│   │   │   └── index.ts        # 注册字段 API 实现
│   │   └── index.ts           # API 统一导出
│   ├── axios.ts               # Axios 封装
│   ├── auth.ts                # 认证工具函数
│   ├── query-client.tsx       # React Query 配置
│   └── utils/                 # 工具函数集
│       ├── utils.ts          # 通用工具函数
│       └── validations.ts    # 数据验证规则

├── store/                      # 状态管理
│   ├── index.ts               # 全局状态 (Zustand)
│   ├── auth.ts               # 认证状态
│   └── recruitment.ts        # 招新状态

├── hooks/                     # 自定义 Hooks
│   ├── use-auth.ts          # 认证相关 Hook
│   ├── use-permissions.ts   # 权限相关 Hook
│   └── use-recruitment.ts   # 招新相关 Hook

└── types/                    # TypeScript 类型定义
    ├── auth.ts              # 认证相关类型
    ├── user.ts              # 用户相关类型
    ├── recruitment.ts       # 招新相关类型
    └── application.ts       # 申请相关类型
```

## 🎨 组件设计规范

### 组件命名规则
- **功能组件**: PascalCase (如 `UserProfile.tsx`)
- **布局组件**: 包含 Layout 后缀 (如 `DashboardLayout.tsx`)
- **页面组件**: 与路由路径一致 (如 `page.tsx`)
- **UI组件**: 使用 shadcn/ui 命名规范

### 组件结构规范
```typescript
// 1. 导入依赖
import React from 'react'
import { Button } from '@/components/ui/button'

// 2. 类型定义
interface ComponentProps {
  // Props 类型定义
}

// 3. 组件主体
export function ComponentName({}: ComponentProps) {
  // 4. 状态管理
  const [state, setState] = useState()
  
  // 5. 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [])
  
  // 6. 事件处理
  const handleEvent = () => {
    // 事件处理逻辑
  }
  
  // 7. 渲染逻辑
  return (
    <div>
      {/* JSX 内容 */}
    </div>
  )
}
```

## 🔐 认证与权限规范

### 用户角色定义
```typescript
type UserRole = 'candidate' | 'admin' | 'interviewer'

// 权限对照表
const rolePermissions = {
  candidate: [
    'view_recruitment',
    'submit_application', 
    'view_application_status',
    'edit_profile'
  ],
  admin: [
    'manage_users',
    'manage_recruitment',
    'review_applications',
    'schedule_interviews',
    'send_notifications'
  ],
  interviewer: [
    'view_applications',
    'conduct_interviews',
    'submit_evaluations'
  ]
}
```

### 认证流程
1. **登录**: 邮箱密码 → JWT Token
2. **令牌刷新**: Access Token (15min) + Refresh Token (7天)
3. **权限验证**: Role-based 访问控制
4. **会话管理**: Zustand + localStorage

## 📊 数据状态管理规范

### Zustand 状态管理
```typescript
// store/auth.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  permissions: string[]
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  checkPermissions: (permission: string) => boolean
}
```

### React Query 数据获取
```typescript
// hooks/use-applications.ts
export function useApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => applicationsApi.getApplications(filters),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
}
```

## 🎯 核心业务流程规范

### 申请提交流程
```
候选人 → 选择招新批次 → 填写申请表 → 上传简历 → 提交申请 → 等待审核
```

### 申请状态流转
```typescript
const applicationStatusFlow = {
  initial: 'draft',
  transitions: [
    { from: 'draft', to: 'submitted', action: 'submit' },
    { from: 'submitted', to: 'screening', action: 'start_screening' },
    { from: 'screening', to: 'passed', action: 'pass_screening' },
    { from: 'screening', to: 'rejected', action: 'reject_screening' },
    { from: 'passed', to: 'interview_scheduled', action: 'schedule_interview' },
    { from: 'interview_scheduled', to: 'interview_completed', action: 'complete_interview' },
    { from: 'interview_completed', to: 'offer_sent', action: 'send_offer' },
    { from: 'interview_completed', to: 'rejected', action: 'reject_after_interview' },
    { from: 'offer_sent', to: 'accepted', action: 'accept_offer' },
    { from: 'offer_sent', to: 'declined', action: 'decline_offer' },
    { from: '*', to: 'archived', action: 'archive' }
  ]
}
```

### AI辅助决策流程
1. **简历评分**: 技能匹配度(40%) + 经历相关性(30%) + 表达规范性(15%) + 综合潜力(15%)
2. **技能提取**: 技术栈 + 软技能 + 专业领域识别
3. **面试题生成**: 基于岗位要求 + 候选人技能 + 薄弱点分析

## 🔧 技术实现规范

### API 设计规范
- **RESTful 风格**: 使用标准 HTTP 方法和状态码
- **版本控制**: `/api/v1/` 前缀
- **响应格式**: 统一包装 `{ data, success, message, code }`
- **错误处理**: 统一的错误码和错误信息

### 表单验证规范
- **前端验证**: Zod + React Hook Form
- **后端验证**: 双重验证确保数据完整性
- **实时反馈**: 即时错误提示和验证状态

### 响应式设计规范
- **移动端优先**: 移动优先的响应式策略
- **断点设置**: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- **组件适配**: 使用 shadcn/ui 的响应式组件

## 📈 性能和体验优化

### 加载优化
- **代码分割**: 按页面/功能模块分割
- **懒加载**: 大组件和图片懒加载
- **缓存策略**: React Query 智能缓存

### 用户体验优化
- **骨架屏**: 加载状态骨架屏
- **错误边界**: 组件级错误处理
- **离线支持**: PWA 能力支持
- **无障碍访问**: WCAG 2.1 标准

## 🧪 测试规范

### 测试层级
1. **单元测试**: 工具函数、Hook、组件逻辑
2. **集成测试**: API 调用、状态管理
3. **E2E测试**: 核心业务流程

### 测试覆盖率要求
- 工具函数: 100%
- 业务组件: 80%+
- API 层: 90%+

## 📝 文档规范

### 代码注释
```typescript
/**
 * 用户认证 Hook
 * 提供用户登录、登出、权限检查等功能
 * 
 * @returns {Object} 认证相关的状态和方法
 * @example
 * const { user, login, logout } = useAuth()
 */
```

### 组件文档
- Props 类型定义和说明
- 使用示例和场景说明
- 注意事项和边界情况

## 🔄 API 模块结构调整说明

### 📁 新的模块化结构

为了提高代码的可维护性和可扩展性，API 层进行了模块化重构：

**之前:**
```
src/lib/api/
├── auth.ts
├── users.ts
├── clubs.ts
└── registration-fields.ts
```

**现在:**
```
src/lib/api/
├── auth/
│   ├── types.ts     # 类型定义
│   └── index.ts     # API 实现
├── users/
│   ├── types.ts     # 类型定义
│   └── index.ts     # API 实现
├── clubs/
│   ├── types.ts     # 类型定义
│   └── index.ts     # API 实现
└── registration-fields/
    ├── types.ts     # 类型定义
    └── index.ts     # API 实现
```

### 🎯 结构调整的优势

1. **🔧 关注点分离**: 类型定义和实现逻辑分离，便于维护
2. **📦 模块化组织**: 每个功能模块独立，便于扩展
3. **📋 类型安全性**: 独立的类型文件确保类型一致性
4. **🚀 开发效率**: 便于多人协作开发，减少冲突

### 📝 使用示例

**导入 API:**
```typescript
import { authApi, usersApi, clubsApi } from '@/lib/api'
```

**导入类型:**
```typescript
import type { UserProfile, Club, LoginRequest } from '@/lib/api'
```

### 🔄 向后兼容性

重构保持了完整的向后兼容性：
- 统一导出入口保持不变 (`src/lib/api/index.ts`)
- 所有现有导入路径继续有效
- API 接口签名不变

---

*此规则文件基于高校社团智能化在线招新系统的需求文档制定，指导项目的整体架构和开发规范。*
