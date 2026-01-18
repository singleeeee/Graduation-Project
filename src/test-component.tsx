'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestComponent() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>测试卡片</CardTitle>
          <CardDescription>这是一个测试</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>测试按钮</Button>
        </CardContent>
      </Card>
    </div>
  )
}