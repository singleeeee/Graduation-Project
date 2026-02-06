"use client"

import React from 'react'
import { ApiTestButton } from '@/components/test/ApiTestButton'

export default function TestErrorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">API错误处理测试页面</h1>
      <p className="mb-4 text-gray-600">
        这个页面用于测试全局错误处理机制是否正常工作。
        点击下面的按钮来测试不同类型的API错误。
      </p>
      
      <ApiTestButton />
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">预期行为：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>点击"测试API错误"按钮应该显示一个toast提示</li>
          <li>点击"测试未授权错误"按钮应该显示401错误或跳转到登录页</li>
          <li>所有API错误都应该自动显示toast提示，无需手动处理</li>
        </ul>
      </div>
    </div>
  )
}