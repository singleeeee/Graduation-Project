import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="z-10 max-w-4xl w-full text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            招新管理系统
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            基于 Next.js 的现代化招新管理平台
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-2">现代化技术栈</h3>
            <p className="text-gray-600">使用 Next.js 15、TypeScript、Tailwind CSS 等前沿技术</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-green-600 text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">高性能</h3>
            <p className="text-gray-600">TanStack Query 和 Zustand 提供卓越的数据管理体验</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-purple-600 text-3xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">美观界面</h3>
            <p className="text-gray-600">shadcn/ui 组件库提供现代化的用户界面</p>
          </div>
        </div>

        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/demo">技术演示</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">登录系统</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}