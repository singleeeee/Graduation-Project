"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useRecruitments,
  useUpdateRecruitmentStatus,
  useDeleteRecruitment,
  useClubsForSelection,
} from "@/hooks/use-recruitment";
import {
  RecruitmentStatus,
  RecruitmentBatch,
} from "@/lib/api/recruitment/types";
import { usePermissions } from "@/hooks/use-permissions";
import { useAppStore } from "@/store";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  type LucideIcon,
} from "lucide-react";

export default function RecruitmentListPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { hasPermission, isLoading: permLoading } = usePermissions();

  // 超级管理员拥有 club_manage 权限（可按社团筛选）
  const isSuperAdmin = hasPermission("club_manage");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RecruitmentStatus | "all">(
    "all",
  );
  const [clubFilter, setClubFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState<
    string | null
  >(null);

  // 防抖处理搜索输入
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 构建查询参数
  const queryParams = React.useMemo(() => {
    return {
      search: debouncedSearchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      clubId: clubFilter !== "all" ? clubFilter : undefined,
      page: 1,
      limit: 50,
    };
  }, [debouncedSearchTerm, statusFilter, clubFilter]);

  const {
    data: recruitmentsData,
    isLoading,
    error,
  } = useRecruitments(queryParams);

  // 仅 super_admin 加载社团列表用于筛选
  const { data: clubs = [] } = useClubsForSelection(isSuperAdmin);

  const updateStatusMutation = useUpdateRecruitmentStatus();
  const deleteRecruitmentMutation = useDeleteRecruitment();

  // 状态标签
  const getStatusBadge = (status: RecruitmentStatus) => {
    const statusConfig: Record<
      RecruitmentStatus,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: LucideIcon;
      }
    > = {
      draft: { label: "草稿", variant: "secondary", icon: Clock },
      published: { label: "已发布", variant: "default", icon: CheckCircle },
      ongoing: { label: "进行中", variant: "default", icon: Clock },
      finished: { label: "已结束", variant: "outline", icon: CheckCircle },
      archived: { label: "已存档", variant: "secondary", icon: Archive },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = async (
    id: string,
    newStatus: RecruitmentStatus,
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ id, data: { status: newStatus } });
      toast.success("状态更新成功！");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      toast.error(`更新状态失败，请重试。 ${errorMessage}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecruitmentId) return;
    try {
      await deleteRecruitmentMutation.mutateAsync(selectedRecruitmentId);
      toast.success("删除成功！");
      setDeleteDialogOpen(false);
      setSelectedRecruitmentId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      toast.error(`删除失败，请重试。 ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">加载失败，请稍后重试</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  // 兼容分页对象和数组两种格式
  let recruitments: RecruitmentBatch[] = [];
  if (Array.isArray(recruitmentsData)) {
    recruitments = recruitmentsData;
  } else if (recruitmentsData && typeof recruitmentsData === "object") {
    const dataObj = recruitmentsData as any;
    recruitments = Array.isArray(dataObj.data) ? dataObj.data : [];
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">
            招新管理
          </h1>
          <p className="mt-2 text-gray-600">管理所有招新项目和批次</p>
        </div>

        <div className="hidden sm:flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/screening")}
          >
            <Eye className="mr-2 h-4 w-4" />
            简历筛选
          </Button>
          <Button onClick={() => router.push("/admin/recruitment/new")}>
            <Plus className="mr-2 h-4 w-4" />
            创建招新
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索招新标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 社团筛选：仅 super_admin 可见，等权限加载完再渲染避免闪烁 */}
            {!permLoading && isSuperAdmin && (
              <div className="w-full sm:w-44">
                <Select
                  value={clubFilter}
                  onValueChange={setClubFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="按社团筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部社团</SelectItem>
                    {(clubs as any[]).map((club: any) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 状态筛选 */}
            <div className="w-full sm:w-40">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as RecruitmentStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="ongoing">进行中</SelectItem>
                  <SelectItem value="finished">已结束</SelectItem>
                  <SelectItem value="archived">已存档</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">标题</TableHead>
                  {!permLoading && isSuperAdmin && (
                    <TableHead className="hidden lg:table-cell">社团</TableHead>
                  )}
                  <TableHead className="hidden sm:table-cell">
                    创建时间
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    截止时间
                  </TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recruitments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={!permLoading && isSuperAdmin ? 6 : 5}
                      className="h-24 text-center"
                    >
                      暂无招新数据
                    </TableCell>
                  </TableRow>
                ) : (
                  recruitments.map((recruitment) => (
                    <TableRow key={recruitment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <Link
                            href={`/admin/recruitment/${recruitment.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {recruitment.title}
                          </Link>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {recruitment.description || "无描述"}
                          </p>
                        </div>
                      </TableCell>
                      {!permLoading && isSuperAdmin && (
                        <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                          {(recruitment as any).club?.name ?? "—"}
                        </TableCell>
                      )}
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-gray-500">
                          {recruitment.createdAt
                            ? new Date(recruitment.createdAt).toLocaleDateString(
                                "zh-CN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm text-gray-500">
                          {recruitment.endTime
                            ? new Date(recruitment.endTime).toLocaleDateString(
                                "zh-CN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(recruitment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">打开菜单</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/admin/recruitment/${recruitment.id}`,
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/admin/recruitment/${recruitment.id}/edit`,
                                )
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                setSelectedRecruitmentId(recruitment.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 移动端创建按钮 */}
          <div className="sm:hidden mt-4">
            <Button
              onClick={() => router.push("/admin/recruitment/new")}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              创建招新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除该招新项目吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
