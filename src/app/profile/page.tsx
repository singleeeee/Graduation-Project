"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store";
import { useRouter, usePathname } from "next/navigation";
import { ProfileDashboard } from "@/components/dashboard/ProfileDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { logout } from "@/lib/auth";
import { useMenuItems } from "@/hooks/use-permissions";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const menuItems = useMenuItems(pathname);

  // 设置页面标题
  useEffect(() => {
    document.title = "个人信息管理 - 招新管理系统";
  }, []);

  // 如果未认证，显示加载状态
  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("退出登录失败:", error);
      router.replace("/login");
    }
  };

  // 根据用户角色选择主题
  const getTheme = () => {
    if (typeof user.role === "object") {
      return user.role.code === "admin" || user.role.code === "super_admin"
        ? "admin"
        : "candidate";
    }
    return user.role === "admin" || user.role === "super_admin"
      ? "admin"
      : "candidate";
  };

  return (
    <DashboardLayout
      user={user}
      logout={handleLogout}
      menuItems={menuItems}
      title="个人信息管理"
      theme={getTheme()}
    >
      <div className="container mx-auto py-6 space-y-4">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              个人信息管理
            </h1>
            <p className="mt-2 text-gray-600">管理您的个人资料和档案信息</p>
          </div>
        </div>

        {/* 个人信息内容 */}
        <ProfileDashboard user={user} isEmbedded={true} />
      </div>
    </DashboardLayout>
  );
}
