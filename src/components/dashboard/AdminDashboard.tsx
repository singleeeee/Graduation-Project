"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMenuItems } from "@/hooks/use-permissions";
import { useAdminDashboard } from "@/hooks/use-applications";
import type { DashboardActivity } from "@/lib/api";

interface AdminDashboardProps {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    role:
      | string
      | {
          id: string;
          name: string;
          code: string;
          level: number;
          permissions: string[];
        }
      | null;
    permissions?: string[];
  };
  logout: () => void;
}

// 状态标签
const STATUS_LABELS: Record<string, string> = {
  submitted: "待筛选",
  screening: "筛选中",
  passed: "通过",
  rejected: "拒绝",
  interview_scheduled: "已安排面试",
  interview_completed: "面试完成",
  offer_sent: "已发 Offer",
  accepted: "已接受",
  declined: "已拒绝",
  archived: "已归档",
  draft: "草稿",
  application_submitted: "提交申请",
  status_changed: "状态变更",
};

// 状态颜色
const STATUS_COLORS: Record<string, string> = {
  passed: "bg-green-100 text-green-700",
  offer_sent: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  declined: "bg-red-100 text-red-700",
  interview_scheduled: "bg-violet-100 text-violet-700",
  interview_completed: "bg-indigo-100 text-indigo-700",
  screening: "bg-yellow-100 text-yellow-700",
  submitted: "bg-gray-100 text-gray-600",
  draft: "bg-gray-100 text-gray-400",
};

// 活动图标颜色
const ACTIVITY_ICON_COLORS: Record<string, string> = {
  application_submitted: "bg-blue-500",
  status_changed: "bg-green-500",
  offer_sent: "bg-purple-500",
  interview_scheduled: "bg-orange-500",
};

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const diff = now - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(isoString).toLocaleDateString("zh-CN");
}

function ActivityItem({ activity }: { activity: DashboardActivity }) {
  const firstChar = activity.applicantName?.charAt(0) ?? "?";
  const iconBg = ACTIVITY_ICON_COLORS[activity.type] ?? "bg-gray-400";
  const statusColor = STATUS_COLORS[activity.status] ?? "bg-gray-100 text-gray-600";
  const statusLabel = STATUS_LABELS[activity.status] ?? activity.status;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        className={`w-9 h-9 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white text-sm font-semibold">{firstChar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">{activity.content}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{formatRelativeTime(activity.time)}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({ user, logout }: AdminDashboardProps) {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, [pathname]);

  const menuItems = useMenuItems(currentPath);
  const { data: dashboard, isLoading, isError } = useAdminDashboard();

  const stats = dashboard?.stats;
  const activities = dashboard?.recentActivities ?? [];

  // 统计卡片配置
  const statCards = [
    {
      label: "总候选人",
      value: stats?.totalApplicants ?? 0,
      icon: <Users className="h-5 w-5 text-white" />,
      bg: "bg-blue-500",
      sub: stats ? `进行中招新 ${stats.activeRecruitments} 个` : undefined,
    },
    {
      label: "已通过",
      value: stats?.passedCount ?? 0,
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      bg: "bg-green-500",
      sub: stats ? `已发 Offer ${stats.offerSentCount}，已接受 ${stats.acceptedCount}` : undefined,
    },
    {
      label: "待面试",
      value: stats?.pendingInterviewCount ?? 0,
      icon: <Clock className="h-5 w-5 text-white" />,
      bg: "bg-yellow-500",
      sub: stats
        ? `待筛选 ${stats.submittedCount}，筛选中 ${stats.screeningCount}`
        : undefined,
    },
    {
      label: "已拒绝",
      value: stats?.rejectedCount ?? 0,
      icon: <XCircle className="h-5 w-5 text-white" />,
      bg: "bg-red-500",
      sub: undefined,
    },
  ];

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      menuItems={menuItems}
      title="管理员仪表盘"
      theme="admin"
    >
      <div className="space-y-6">
        {/* 欢迎语 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            欢迎回来，{user.name || "管理员"}！
          </h1>
          <p className="mt-1 text-gray-500 text-sm">以下是当前的招新数据概览</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label} className="border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${card.bg} flex-shrink-0`}>
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
                    {isLoading ? (
                      <div className="h-7 w-12 bg-gray-100 animate-pulse rounded" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    )}
                    {card.sub && !isLoading && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{card.sub}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 快速操作 + 最近活动 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 快速操作 */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                快速操作
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/recruitment/new-batch">
                <Button variant="outline" className="w-full justify-between text-sm">
                  发布新招新
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/screening">
                <Button variant="outline" className="w-full justify-between text-sm">
                  简历筛选
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/recruitment">
                <Button variant="outline" className="w-full justify-between text-sm">
                  管理招新批次
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/clubs">
                <Button variant="outline" className="w-full justify-between text-sm">
                  社团管理
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-between text-sm">
                  用户管理
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">加载中...</span>
                </div>
              ) : isError ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  数据加载失败，请刷新页面重试
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  暂无最近活动
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {activities.map((activity, idx) => (
                    <ActivityItem key={idx} activity={activity} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
