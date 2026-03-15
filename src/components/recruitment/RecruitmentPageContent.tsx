"use client";

import React from "react";
import { Search, FileText, CheckCircle2 } from "lucide-react";
import { RecruitmentList } from "./RecruitmentList";

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "浏览招新",
    desc: "查看各社团的招新信息、要求和截止时间",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: FileText,
    step: "02",
    title: "提交申请",
    desc: "完善个人信息，填写申请表并提交",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "等待结果",
    desc: "社团审核后通知面试安排或录取结果",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
];

export function RecruitmentPageContent() {
  return (
    <div className="space-y-8">
      {/* 页头 Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-8 py-10 text-white">
        {/* 装饰圆 */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-sm font-medium text-blue-200 mb-2 tracking-wide uppercase">
            高校社团招新平台
          </p>
          <h1 className="text-3xl font-bold mb-3">找到属于你的社团</h1>
          <p className="text-blue-100 max-w-xl leading-relaxed">
            浏览当前开放的招新批次，加入志同道合的组织，开启你的大学社团生涯
          </p>
        </div>
      </div>

      {/* 申请流程 */}
      <div>
        <h2 className="text-base font-semibold text-gray-500 mb-4 tracking-wide uppercase">申请流程</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((item, idx) => (
            <div
              key={idx}
              className={`relative flex items-start gap-4 rounded-xl border ${item.border} ${item.bg} p-5`}
            >
              {/* 连接线（仅中间两段） */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-2 w-4 h-0.5 bg-gray-200 z-10" />
              )}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className={`text-xs font-bold mb-0.5 ${item.color}`}>STEP {item.step}</p>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 招新列表 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">最新招新</h2>
            <p className="text-sm text-gray-500 mt-0.5">浏览当前开放的招新批次</p>
          </div>
        </div>
        <RecruitmentList />
      </div>
    </div>
  );
}
