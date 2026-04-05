import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store";
import { usersApi, rolesApi, permissionsApi } from "@/lib/api";
import {
  LayoutDashboard,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Building2,
  Megaphone,
  Users,
  FileText,
  ClipboardList,
  UserCircle,
  Settings,
  Mail,
  type LucideIcon,
} from "lucide-react";

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

  // 从 store 或 profile 中提取权限 code 数组（字符串数组格式）
  const normalizePerms = (arr: any[]): string[] =>
    arr.map((p) => (typeof p === 'string' ? p : p?.code ?? '')).filter(Boolean);

  // 优先使用 userProfile（最新），其次 store 里的 permissions
  const userPermissions: string[] = userProfile?.permissions
    ? normalizePerms(userProfile.permissions)
    : user?.permissions
    ? normalizePerms(user.permissions as any[])
    : [];

  // 用 Set 提升查找性能
  const permissionSet = new Set(userPermissions);

  // 检查用户是否具有指定权限（直接查 permissions 列表，不做角色特判）
  const hasPermission = (permissionCode: string): boolean =>
    permissionSet.has(permissionCode);

  // 检查用户是否具有任一权限
  const hasAnyPermission = (permissionCodes: string[]): boolean =>
    permissionCodes.some((code) => permissionSet.has(code));

  // 检查用户是否具有所有权限
  const hasAllPermissions = (permissionCodes: string[]): boolean =>
    permissionCodes.every((code) => permissionSet.has(code));

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
export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  current: boolean;
  permission?: string;
  permissions?: string[];
  /** 若用户拥有此权限，则隐藏该菜单项（用于区分候选人和管理员共享同一权限的场景） */
  excludePermission?: string;
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
      icon: LayoutDashboard,
      href: "/",
      current: currentPath === "/",
    },
    {
      title: "角色管理",
      icon: ShieldCheck,
      href: "/admin/roles",
      current: currentPath.startsWith("/admin/roles"),
      permissions: ["role_read", "role_update"],
    },
    {
      title: "字段管理",
      icon: SlidersHorizontal,
      href: "/admin/registration-fields",
      current: currentPath.startsWith("/admin/registration-fields"),
      permission: "registrationfield_manage",
    },
    {
      title: "用户管理",
      icon: UserCog,
      href: "/admin/users",
      current: currentPath.startsWith("/admin/users"),
      permission: "user_read",
    },
    {
      title: "社团管理",
      icon: Building2,
      href: "/admin/clubs",
      current: currentPath.startsWith("/admin/clubs"),
      permission: "club_manage",
    },
    {
      title: "招新管理",
      icon: Megaphone,
      href: "/admin/recruitment",
      current: currentPath.startsWith("/admin/recruitment"),
      // 仅管理员角色可见，候选人虽有 recruitment_read 但不应看到管理菜单
      permissions: ["recruitment_create", "recruitment_update"],
    },
    {
      title: "招新信息",
      icon: Users,
      href: "/recruitment",
      current: currentPath.startsWith("/recruitment"),
      // 候选人专属：有 recruitment_read 但没有 recruitment_update（管理员有 update，不需要这个入口）
      permission: "recruitment_read",
      excludePermission: "recruitment_update",
    },
    {
      title: "我的申请",
      icon: FileText,
      href: "/applications",
      current: currentPath.startsWith("/applications"),
      // 候选人专属：有 application_read 但没有 application_update
      permission: "application_read",
      excludePermission: "application_update",
    },
    {
      title: "简历筛选",
      icon: ClipboardList,
      href: "/admin/screening",
      current: currentPath.startsWith("/admin/screening"),
      permissions: ["application_read", "application_update"],
    },
    {
      title: "邮件系统",
      icon: Mail,
      href: "/admin/email",
      current: currentPath.startsWith("/admin/email"),
      permission: "user_read",
    },
    {
      title: "个人信息",
      icon: UserCircle,
      href: "/profile",
      current: currentPath === "/profile",
    },
    {
      title: "系统设置",
      icon: Settings,
      href: "/settings",
      current: currentPath.startsWith("/settings"),
      permission: "systemsetting_read",
    },
  ];

  // 统一基于 permissions 过滤菜单，不再对角色做特判
  return allMenuItems.filter((item) => {
    // excludePermission：若用户拥有该权限则隐藏（优先判断）
    if (item.excludePermission && hasPermission(item.excludePermission)) {
      return false;
    }
    if (!item.permission && !item.permissions) {
      return true; // 无权限要求，所有登录用户可见
    }
    if (item.permission) {
      return hasPermission(item.permission);
    }
    if (item.permissions) {
      return hasAnyPermission(item.permissions);
    }
    return false;
  });
}
