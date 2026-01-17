# Axios 封装与 API 层实现总结

## 🎯 实现目标

成功完成了招聘管理系统的前端认证系统，包括 Axios 封装、双 token 自动刷新机制和完整的 API 层。

## 📁 文件结构

```
src/
├── lib/
│   ├── axios.ts                 # Axios 核心封装
│   ├── auth.ts                  # 认证工具函数
│   ├── api/
│   │   ├── index.ts             # API 统一导出
│   │   ├── auth.ts              # 认证相关 API
│   │   ├── users.ts             # 用户管理 API
│   │   └── __tests__/
│   │       └── auth.test.ts     # API 测试
│   ├── validations.ts           # 数据验证规则
│   ├── query-client.tsx         # React Query 配置
│   └── utils.ts                 # 工具函数
├── store/
│   └── index.ts                 # 状态管理 (已更新认证功能)
├── app/
│   ├── login/page.tsx           # 登录页面 (已更新)
│   ├── register/page.tsx        # 注册页面 (已更新)
│   └── api-example/page.tsx     # API 示例页面
└── components/
    └── (UI 组件保持不变)
```

## 🚀 核心功能实现

### 1. Axios 封装 (`src/lib/axios.ts`)

- ✅ **双 token 自动刷新机制**
  - Access Token 用于 API 认证
  - Refresh Token 用于获取新的 Access Token
  - 自动拦截 401 错误并尝试刷新
  - 多个并发请求时的队列管理

- ✅ **请求拦截器**
  - 自动添加 Authorization header
  - 支持自定义请求配置

- ✅ **响应拦截器**
  - 统一错误处理
  - 自动数据提取
  - 网络错误处理

- ✅ **令牌管理**
  - localStorage 存储 (浏览器环境)
  - 安全清除令牌机制
  - 令牌有效性检查

### 2. API 层封装

#### 认证 API (`src/lib/api/auth.ts`)

- **登录**: `POST /api/v1/auth/login`
- **注册**: `POST /api/v1/auth/register`
- **刷新令牌**: `POST /api/v1/auth/refresh`
- **登出**: `POST /api/v1/auth/logout`
- **健康检查**: `GET /api/v1/health`
- **令牌验证**: `GET /api/v1/auth/validate`

#### 用户 API (`src/lib/api/users.ts`)

- **获取资料**: `GET /api/v1/users/profile`
- **更新资料**: `PUT /api/v1/users/profile`
- **修改密码**: `PUT /api/v1/users/change-password`
- **上传头像**: `POST /api/v1/users/avatar`
- **用户列表**: `GET /api/v1/users` (管理员)
- **用户统计**: `GET /api/v1/users/stats` (管理员)
- **批量导入**: `POST /api/v1/users/import` (管理员)
- **数据导出**: `GET /api/v1/users/export` (管理员)

### 3. 集成到现有组件

#### 登录页面更新
- 使用真实的认证 API
- 自动保存令牌到 localStorage
- 自动更新用户状态到 Zustand store
- 错误处理和加载状态

#### 注册页面更新
- 添加密码字段和确认密码验证
- 使用真实注册 API
- 完整的表单验证
- 成功提示信息

#### 状态管理增强
- 添加认证状态检查方法
- 添加角色权限检查方法
- 支持管理员、候选人、面试官三种角色

## 🔧 技术特性

### 安全特性
- ✅ JWT 令牌认证
- ✅ Access Token 15 分钟过期
- ✅ Refresh Token 7 天过期
- ✅ 自动令牌刷新
- ✅ 安全令牌存储
- ✅ 网络错误处理

### 错误处理
- ✅ 统一的错误拦截器
- ✅ 401 错误自动处理
- ✅ 网络连接失败处理
- ✅ 用户友好的错误提示

### 用户体验
- ✅ 自动登录状态维护
- ✅ 令牌失效自动跳转登录
- ✅ 加载状态和错误提示
- ✅ 响应式表单验证

## 📝 使用示例

### 基本认证
```typescript
import { authApi, loginAndSetUser } from '@/lib/api'

// 登录
const user = await loginAndSetUser('user@example.com', 'password')

// 检查认证状态
if (authApi.isAuthenticated()) {
  console.log('用户已登录')
}

// 登出
await authApi.logout()
```

### 用户管理
```typescript
import { usersApi } from '@/lib/api'

// 获取用户资料
const profile = await usersApi.getProfile()

// 更新资料
const updatedProfile = await usersApi.updateProfile({
  name: '新姓名',
  phone: '12345678901'
})
```

### 权限检查
```typescript
import { useAppStore } from '@/store'

const { isAdmin, isCandidate, hasRole } = useAppStore()

// 检查管理员权限
if (isAdmin()) {
  // 显示管理员功能
}

// 检查特定角色
if (hasRole('interviewer')) {
  // 显示面试官功能
}
```

## 🔐 环境配置

创建了 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_JWT_EXPIRES_IN=15m
NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES_IN=7d
```

## 🧪 测试

创建了 API 测试文件，包含：
- 健康检查测试
- 认证状态测试
- 令牌管理测试
- 本地存储操作测试

## 🎨 UI/UX 改进

- ✅ 登录页面集成真实 API
- ✅ 注册页面添加密码字段
- ✅ 表单验证和错误提示
- ✅ 加载状态指示器
- ✅ 响应式布局

## 🔄 向后兼容性

- ✅ 保持现有组件结构
- ✅ 维持原有状态管理接口
- ✅ 不破坏现有功能
- ✅ 渐进式更新

## 🚀 下一步建议

1. **添加更多测试**
   - 完整集成测试
   - 端到端测试 (Cypress/E2E)
   - 组件单元测试

2. **增强安全性**
   - 添加请求速率限制
   - 实现 CSRF 保护
   - HTTPS 强制

3. **用户体验优化**
   - 添加记住密码功能
   - 实现密码重置功能
   - 添加多因素认证

4. **性能优化**
   - 请求缓存策略
   - 响应数据压缩
   - 批量操作支持

## 📚 开发说明

### 开发环境要求
- Node.js 18+
- Next.js 15+
- React 18+

### 依赖安装
```bash
npm install axios
```

### 启动开发服务器
```bash
npm run dev
```

### 访问示例页面
访问 `/api-example` 查看 API 集成效果

---

## ✨ 总结

通过本实现，我们成功构建了一个完整的前端认证系统，具备：

- 🔒 **安全可靠的双 token 机制**
- 🚀 **完整的 API 封装层**
- 🎯 **优雅的错误处理**
- 💅 **良好的用户体验**
- 🔧 **易于维护的代码结构**

这个系统可以轻松扩展到更多的业务模块，为招聘管理系统提供坚实的基础架构支持。