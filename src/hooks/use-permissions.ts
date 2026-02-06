import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store";
import { usersApi, rolesApi, permissionsApi } from "@/lib/api";

/**
 * 权限检查 Hook
 * 提供用户权限验证和角色管理功能
 *
 * @returns 权限检查相关的状态和方法
 */
export function usePermissions() {
  const { user } = useAppStore();

  // 获取当前用户详情（包含权限信息）
  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await usersApi.getProfile();
      return response;
    },
    enabled: !!user?.id, // 用户已登录且有ID时启用
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    // 确保只在需要时调用，避免登录时的重复调用
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // 从profile中提取权限代码数组
  const userPermissions =
    userProfile?.permissions?.map((p: { code: string }) => p.code) ||
    user?.permissions ||
    [];

  // 检查用户是否具有指定权限
  const hasPermission = (permissionCode: string): boolean => {
    // 超级管理员和系统管理员拥有所有权限
    if (user?.roleCode === "super_admin" || user?.roleCode === "system_admin") {
      return true;
    }

    return userPermissions.includes(permissionCode);
  };

  // 检查用户是否具有任一权限
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    // 超级管理员和系统管理员拥有所有权限
    if (user?.roleCode === "super_admin" || user?.roleCode === "system_admin") {
      return true;
    }

    return permissionCodes.some((code) => userPermissions.includes(code));
  };

  // 检查用户是否具有所有权限
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    // 超级管理员和系统管理员拥有所有权限
    if (user?.roleCode === "super_admin" || user?.roleCode === "system_admin") {
      return true;
    }

    return permissionCodes.every((code) => userPermissions.includes(code));
  };

  // 检查用户角色级别是否足够（简化实现）
  const hasRoleLevel = (requiredLevel?: number): boolean => {
    // 如果没有提供级别要求，默认为true
    if (requiredLevel === undefined) return true;

    // 基于角色代码的简化级别判断
    const roleLevels: Record<string, number> = {
      super_admin: 100,
      system_admin: 90,
      club_admin: 80,
      interviewer: 70,
      candidate: 10,
    };

    const userLevel = roleLevels[user?.roleCode || ""] || 0;
    return userLevel >= requiredLevel;
  };

  // 检查用户是否具有指定角色
  const hasRole = (roleCode: string): boolean => {
    return user?.roleCode === roleCode;
  };

  // 检查用户是否具有任一角色
  const hasAnyRole = (roleCodes: string[]): boolean => {
    return roleCodes.includes(user?.roleCode || "");
  };

  return {
    // 用户权限信息
    userPermissions,
    userProfile,

    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // 角色检查方法
    hasRoleLevel,
    hasRole,
    hasAnyRole,

    // 加载状态
    isLoading,
    error,
  };
}

/**
 * 角色管理 Hook
 * 提供角色相关的数据获取和管理功能
 */
export function useRoles(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  isActive?: boolean;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["roles", filters],
    queryFn: () => rolesApi.getRoles(filters),
    select: (response) => {
      // rolesApi.getRoles 直接返回 Role[]，不需要额外的数据提取
      return {
        roles: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: 1,
        limit: Array.isArray(response) ? response.length : 0,
        totalPages: 1,
      };
    },
  });

  return {
    roles: data?.roles || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 权限管理 Hook
 * 提供权限相关的数据获取和管理功能
 */
export function usePermissionsList(filters?: {
  page?: number;
  limit?: number;
  module?: string;
  search?: string;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["permissions", filters],
    queryFn: () => permissionsApi.getPermissions(filters),
    select: (response) => {
      // permissionsApi.getPermissions 直接返回 Permission[]，不需要额外的数据提取
      return {
        permissions: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: 1,
        limit: Array.isArray(response) ? response.length : 0,
        totalPages: 1,
      };
    },
  });

  return {
    permissions: data?.permissions || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 权限模块 Hook
 * 获取所有权限模块列表
 */
export function usePermissionModules() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["permissionModules"],
    queryFn: () => permissionsApi.getPermissionModules(),
    select: (response) => {
      // permissionsApi.getPermissionModules 直接返回数组，不需要额外的数据提取
      return Array.isArray(response) ? response : [];
    },
  });

  return {
    modules: data || [],
    isLoading,
    error,
  };
}

/**
 * 角色详情 Hook
 * 获取指定角色的详细信息
 */
export function useRoleDetail(roleId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["roleDetail", roleId],
    queryFn: () => rolesApi.getRole(roleId),
    enabled: !!roleId,
    select: (response) => {
      // rolesApi.getRole 返回 ApiResponse<RoleDetail>，需要提取 data
      return response?.data || response;
    },
  });

  return {
    role: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 权限详情 Hook
 * 获取指定权限的详细信息
 */
export function usePermissionDetail(permissionId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["permissionDetail", permissionId],
    queryFn: () => permissionsApi.getPermission(permissionId),
    enabled: !!permissionId,
    select: (response) => {
      // permissionsApi.getPermission 返回 ApiResponse<Permission>，需要提取 data
      return response?.data || response;
    },
  });

  return {
    permission: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 菜单项类型定义
 */
interface MenuItem {
  title: string;
  icon: string;
  href: string;
  current: boolean;
  permission?: string;
  permissions?: string[];
}

/**
 * 菜单项 Hook
 * 根据用户权限动态生成菜单项
 */
export function useMenuItems(currentPath: string = "/"): MenuItem[] {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { user } = useAppStore();

  const allMenuItems: MenuItem[] = [
    {
      title: "仪表盘",
      icon: "📊",
      href: "/",
      current: currentPath === "/",
    },
    {
      title: "角色管理",
      icon: "🛡️",
      href: "/admin/roles",
      current: currentPath.startsWith("/admin/roles"),
      permission: "role_manage",
    },
    {
      title: "字段管理",
      icon: "⚙️",
      href: "/admin/registration-fields",
      current: currentPath.startsWith("/admin/registration-fields"),
      permission: "registration_field_manage",
    },
    {
      title: "用户管理",
      icon: "👤",
      href: "/admin/users",
      current: currentPath.startsWith("/admin/users"),
      permission: "user_view",
    },
    {
      title: "社团管理",
      icon: "🏢",
      href: "/admin/clubs",
      current: currentPath.startsWith("/admin/clubs"),
      permission: "user_manage",
    },
    {
      title: "招新管理",
      icon: "📢",
      href: "/admin/recruitment",
      current: currentPath.startsWith("/admin/recruitment"),
      permission: "recruitment_manage",
    },
    {
      title: "招新信息",
      icon: "👥",
      href: "/recruitment",
      current: currentPath.startsWith("/recruitment"),
      permission: "recruitment_view",
    },
    {
      title: "我的申请",
      icon: "📝",
      href: "/applications",
      current: currentPath.startsWith("/applications"),
      permission: "view_application_status",
    },
    {
      title: "简历筛选",
      icon: "📋",
      href: "/admin/screening",
      current: currentPath.startsWith("/admin/screening"),
      permission: "application_review",
    },
    {
      title: "面试安排",
      icon: "📅",
      href: "/interview",
      current: currentPath.startsWith("/interview"),
      permission: "interview_manage",
    },
    {
      title: "个人信息",
      icon: "👤",
      href: "/profile",
      current: currentPath === "/profile",
    },
    {
      title: "系统设置",
      icon: "🔧",
      href: "/settings",
      current: currentPath.startsWith("/settings"),
      permission: "system_settings",
    },
  ];

  // 获取用户角色
  const userRole = user?.role || "candidate";

  // 根据权限过滤菜单项
  return allMenuItems.filter((item) => {
    // 对于候选人角色，只显示特定的菜单项
    if (userRole === "candidate") {
      const candidateAllowedMenus = [
        "仪表盘",
        "个人信息",
        "我的申请",
        "招新信息",
      ];
      return candidateAllowedMenus.includes(item.title);
    }

    // 对于管理员角色，根据权限过滤
    if (!item.permission && !item.permissions) {
      return true; // 没有权限要求的菜单项总是显示
    }

    if (item.permission) {
      return hasPermission(item.permission);
    }

    if (item.permissions) {
      // 可以根据需求配置为任一权限或全部权限
      return hasAnyPermission(item.permissions);
    }

    return false;
  });
}
