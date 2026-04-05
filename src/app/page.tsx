"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { logout as authLogout, initializeAuth } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { CandidateDashboard } from "@/components/dashboard/CandidateDashboard";
import WelcomePage from "@/components/pages/WelcomePage";
import { Loader2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function Home() {
  const router = useRouter();
  const { user } = useAppStore();
  const { hasPermission } = usePermissions();
  // 用响应式 state 追踪认证状态，避免静态 if 判断
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const result = await initializeAuth();
      if (isMounted) {
        setAuthStatus(result ? "authenticated" : "unauthenticated");
      }
    };
    check();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    await authLogout();
    setAuthStatus("unauthenticated");
    router.replace("/login");
  };

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return <WelcomePage />;
  }

  // 已认证，根据权限展示对应页面
  // 拥有 recruitment_read 权限的用户进入管理员仪表盘
  const isAdmin = hasPermission("recruitment_read") || hasPermission("user_read");

  if (isAdmin) {
    return <AdminDashboard user={user} logout={handleLogout} />;
  }

  return <CandidateDashboard user={user} logout={handleLogout} />;
}
