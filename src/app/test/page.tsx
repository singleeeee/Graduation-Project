'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>测试页面</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>测试按钮</Button>
        </CardContent>
      </Card>
    </div>
  )
}