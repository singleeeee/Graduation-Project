"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RecruitmentBatchForm } from '@/components/recruitment/RecruitmentBatchForm'
import { useCreateRecruitmentBatch } from '@/hooks/use-recruitment'
import { useClubsForSelection, useRegistrationFieldsForSelection } from '@/hooks/use-recruitment'
import type { CreateRecruitmentBatchRequest } from '@/lib/api/recruitment/types'
import type { Club, RegistrationField } from '@/lib/api'

export default function NewRecruitmentPage() {
  const router = useRouter()
  const createRecruitmentMutation = useCreateRecruitmentBatch()
  const { data: clubsData, isLoading: clubsLoading } = useClubsForSelection()
  const { data: fieldsData, isLoading: fieldsLoading } = useRegistrationFieldsForSelection()

  console.log('Clubs data:', clubsData)
  console.log('Fields data:', fieldsData)

  const handleSubmit = async (data: CreateRecruitmentBatchRequest) => {
    try {
      // 向后端提交数据，此时id会被后端生成
      await createRecruitmentMutation.mutateAsync(data)
      // 创建成功后跳转到列表页面
      toast.success('招新批次创建成功！')
      router.push(`/admin/recruitment`)
    } catch (error) {
      console.error('创建招新失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      toast.error(`创建失败：${errorMessage}`)
    }
  }

  const clubOptions = clubsData?.map((club: Club) => ({
    id: club.id,
    name: club.name
  })) || []

  const registrationFieldOptions = fieldsData?.map((field: RegistrationField) => ({
    id: field.id,
    name: field.fieldLabel || field.fieldName,
    fieldKey: field.fieldName
  })) || []

  if (clubsLoading || fieldsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载表单数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">创建招新批次</h1>
        <p className="mt-2 text-gray-600">创建新的社团招新批次和招募计划</p>
      </div>
      
      <RecruitmentBatchForm
        clubOptions={clubOptions}
        registrationFieldOptions={registrationFieldOptions}
        onSubmit={handleSubmit}
        isLoading={createRecruitmentMutation.isPending}
        submitButtonText="创建批次"
      />
    </div>
  )
}