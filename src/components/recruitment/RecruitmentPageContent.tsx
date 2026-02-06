"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecruitmentList } from "./RecruitmentList";

export function RecruitmentPageContent() {
  return (
    <div>
      {/* 使用指南 */}
      <div className="my-6">
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              申请流程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-2">浏览招新</h4>
                <p className="text-sm text-gray-600">
                  查看各社团的招新信息和要求
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">提交申请</h4>
                <p className="text-sm text-gray-600">
                  完善个人信息并上传相关材料
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">等待结果</h4>
                <p className="text-sm text-gray-600">
                  社团审核并通知面试或录取结果
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 招新批次列表 */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">最新招新</h2>
          <p className="text-gray-600">
            浏览当前开放的招新批次，找到你的心仪社团
          </p>
        </div>

        <RecruitmentList />
      </div>
    </div>
  );
}
