"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { usePermissions } from "@/hooks/use-permissions";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAuth?: boolean;
}

/**
 * 权限保护组件
 * - 检查用户是否已认证
 * - 检查用户是否具有指定的权限
 * - 检查用户是否具有指定的角色
 */
export function PermissionGuard({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAuth = true,
}: PermissionGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppStore();
  const { hasPermission, hasAnyPermission, hasRole, hasAnyRole, isLoading: permissionsLoading } = usePermissions();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // 等待权限加载完成
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (!permissionsLoading) {
              clearInterval(interval);
              resolve(undefined);
            }
          }, 100);
        });

        // 检查认证状态
        if (requireAuth && !user?.id) {
          router.push("/login");
          return;
        }

        // 检查角色要求
        if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
          router.push("/");
          return;
        }

        // 检查权限要求
        if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
          router.push("/");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("权限检查失败:", error);
        router.push("/");
      }
    };

    checkPermissions();
  }, [user?.id, requiredPermissions, requiredRoles, requireAuth, hasAnyPermission, hasAnyRole, permissionsLoading, router]);

  // 如果正在加载，显示加载状态
  if (isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
