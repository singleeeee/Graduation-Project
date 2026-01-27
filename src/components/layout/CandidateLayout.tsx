"use client"

import React from 'react'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout, SidebarProvider } from './DashboardLayout'

interface CandidateLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  showStats?: boolean
}

export function CandidateLayout({ 
  title, 
  subtitle, 
  children, 
  showStats = true 
}: CandidateLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>
        
        {/* 统计数据卡片 */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  活跃社团
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">50+</div>
                <p className="text-xs text-muted-foreground">覆盖各个学院</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  招新批次
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">200+</div>
                <p className="text-xs text-muted-foreground">学期总招新数</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  申请人数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5000+</div>
                <p className="text-xs text-muted-foreground">累计申请数</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  成功率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65%</div>
                <p className="text-xs text-muted-foreground">平均录取率</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* 主要内容 */}
      <div className="space-y-8">
        {children}
      </div>
    </div>
  )
}