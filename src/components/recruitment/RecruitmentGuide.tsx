"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GraduationCap, Users, FileText, CheckCircle } from 'lucide-react'

interface RecruitmentGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecruitmentGuide({ open, onOpenChange }: RecruitmentGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            招新平台使用指南
          </DialogTitle>
          <DialogDescription>
            欢迎使用高校社团智能化在线招新系统
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg">发现社团</h3>
              <p className="text-sm text-gray-600">
                浏览各社团的招新信息，了解社团文化和岗位要求
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg">提交申请</h3>
              <p className="text-sm text-gray-600">
                完善个人信息，上传简历和相关材料，提交申请
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="bg-orange-100 text-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg">关注结果</h3>
              <p className="text-sm text-gray-600">
                实时查看申请进度，接收面试通知和录取结果
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4">申请提示</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                请确保个人信息真实有效
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                简历格式支持PDF、Word，大小不超过5MB
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                每个招新批次只能申请一次
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                申请提交后可在个人中心查看详细进度
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            我知道了
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}