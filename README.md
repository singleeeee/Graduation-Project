# 招新管理系统

基于 Next.js 构建的现代化招新管理系统，毕设项目。

## 技术栈

### 核心框架
- **Next.js 15** - React 全栈框架
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 原子化 CSS 框架

### 状态管理
- **Zustand** - 轻量级状态管理库
- **TanStack Query** - 强大的数据获取和缓存库

### 表单处理
- **React Hook Form** - 高性能表单库
- **Zod** - TypeScript 优先的模式验证
- **@hookform/resolvers** - 表单验证集成

### UI 组件库
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Radix UI** - 无障碍访问的原始组件
- **Lucide React** - 图标库

### 工具函数
- **dayjs** - 轻量级日期处理库
- **uuid** - UUID 生成库

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 后处理器

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── login/             # 登录页面
│   └── demo/              # 技术演示页面
├── components/            # React 组件
│   └── ui/               # shadcn/ui 组件
├── lib/                  # 工具函数和配置
│   ├── utils.ts         # 通用工具函数
│   ├── query-client.ts  # TanStack Query 配置
│   └── validations.ts   # Zod 验证模式
└── store/               # Zustand 状态管理
    └── index.ts         # 全局状态
```

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 页面说明

- **首页** (`/`) - 系统首页
- **登录页** (`/login`) - 演示 React Hook Form + Zod 表单验证
- **演示页** (`/demo`) - 展示各技术栈的使用方法

## 主要特性

### ✅ 现代化技术栈
- 使用最新的 Next.js 15 App Router
- 完整的 TypeScript 支持
- 组件化开发模式

### ✅ 表单处理
- React Hook Form 提供高性能表单处理
- Zod 进行类型安全的表单验证
- 实时错误提示和验证

### ✅ 状态管理
- Zustand 轻量级全局状态管理
- TanStack Query 处理服务器状态和数据缓存
- 优化的数据获取和错误处理

### ✅ UI 组件
- shadcn/ui 提供美观的现代化组件
- 完整的主题系统支持
- 响应式设计

### ✅ 工具函数
- dayjs 强大的日期处理能力
- uuid 唯一标识符生成
- 通用工具函数封装

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。