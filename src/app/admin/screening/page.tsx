"use client";

import { useState, useEffect } from "react";
import {
  useApplications,
  useApplicationDetail,
} from "@/hooks/use-applications";
import { usePermissions } from "@/hooks/use-permissions";
import { useQueryClient } from "@tanstack/react-query";
import { useRegistrationFields } from "@/hooks/use-registration-fields";
import { useRecruitments } from "@/hooks/use-recruitment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Download,
  Building2,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ApplicationStatus } from "@/lib/api/applications/types";

/**
 * 简历筛选页面(表格版)
 * 管理员可以高效地管理和评估大量申请者简历
 */
export default function ResumeScreeningPage() {
  const { hasPermission } = usePermissions();

  // 筛选状态
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as ApplicationStatus | "all",
    recruitmentId: "",
    clubId: "", // 社团ID筛选，移除默认的"all"选项
    minScore: "",
    maxScore: "",
    grade: "",
    major: "",
    skills: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  // 获取注册字段配置
  const { data: allRegistrationFields = [], isLoading: isFieldsLoading } =
    useRegistrationFields();

  // 获取招新列表用于建立动态字段映射
  const { data: recruitmentsData } = useRecruitments();

  // 数据加载完成后，自动默认选中第一个社团
  useEffect(() => {
    if (!recruitmentsData?.data?.length) return;
    setFilters((prev) => {
      if (prev.clubId) return prev; // 已经选了就不覆盖
      const firstClubId = recruitmentsData.data[0].club?.id;
      if (!firstClubId) return prev;
      return { ...prev, clubId: firstClubId };
    });
  }, [recruitmentsData]);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    [],
  );
  const [bulkActionStatus, setBulkActionStatus] = useState<
    ApplicationStatus | ""
  >("");
  // 控制详情模态框的显示
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const queryClient = useQueryClient();

  // 获取申请列表
  const { data, isLoading, error } = useApplications({
    status: filters.status !== "all" ? filters.status : undefined,
    recruitmentId: filters.recruitmentId || undefined,
    clubId: filters.clubId || undefined, // 添加社团筛选
    page: 1,
    limit: 100, // 增加每页显示数量以适配表格
  });

  // 获取选中申请的详情
  const {
    data: selectedApplication,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useApplicationDetail(selectedApplicationId || "");

  // 打开详情模态框
  const openDetailModal = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsDetailOpen(true);
  };

  // 关闭详情模态框
  const closeDetailModal = () => {
    setIsDetailOpen(false);
    // 延迟清除选中的申请ID，以便模态框有足够的时间关闭
    setTimeout(() => {
      setSelectedApplicationId(null);
    }, 300);
  };

  const applications = data?.applications || [];

  // fieldName → fieldLabel 映射表，来自系统注册字段配置
  const fieldLabelMap = Object.fromEntries(
    allRegistrationFields.map((f) => [f.fieldName, f.fieldLabel])
  );

  // 兜底的中文标签（覆盖后端可能没有配置到系统字段表的常见字段）
  const FALLBACK_LABELS: Record<string, string> = {
    name: "姓名",
    studentId: "学号",
    phone: "电话",
    email: "邮箱",
    college: "学院",
    major: "专业",
    grade: "年级",
    experience: "相关经验",
    motivation: "申请动机",
  };

  const getFieldLabel = (fieldName: string) =>
    fieldLabelMap[fieldName] || FALLBACK_LABELS[fieldName] || fieldName;

  // 根据当前筛选条件，从招新批次的 requiredFields 中推导出需要展示哪些列
  // 优先级：指定了 recruitmentId → 该批次的 requiredFields
  //         只选了 clubId   → 该社团所有批次 requiredFields 的并集（去重）
  //         都没选          → 空（需要先选社团）
  const dynamicColumns: { fieldName: string; fieldLabel: string }[] = (() => {
    const allRecruitments = recruitmentsData?.data ?? [];

    let requiredFieldNames: string[] = [];

    if (filters.recruitmentId) {
      // 指定了批次：直接取该批次的 requiredFields
      const rec = allRecruitments.find((r) => r.id === filters.recruitmentId);
      requiredFieldNames = rec?.requiredFields ?? [];
    } else if (filters.clubId) {
      // 只选了社团：取该社团所有批次 requiredFields 的并集
      const clubRecruitments = allRecruitments.filter(
        (r) => r.club.id === filters.clubId
      );
      const seen = new Set<string>();
      clubRecruitments.forEach((r) => {
        (r.requiredFields ?? []).forEach((fn) => seen.add(fn));
      });
      requiredFieldNames = Array.from(seen);
    }

    // 长文本字段（textarea 类型），内容过长不适合在表格列中展示，在详情弹窗里查看即可
    const LONG_TEXT_FIELDS = new Set(["experience", "motivation", "resumeText", "selfIntro", "description"]);

    // 过滤掉 name（已在"申请人"列展示）和长文本字段，转成 { fieldName, fieldLabel }
    return requiredFieldNames
      .filter((fn) => fn !== "name" && !LONG_TEXT_FIELDS.has(fn))
      .map((fn) => ({ fieldName: fn, fieldLabel: getFieldLabel(fn) }));
  })();

  // 从申请记录中提取指定字段的值
  // 优先级：formData（候选人提交的表单原始数据）> education > applicant > 顶层字段
  const getFieldValue = (application: any, fieldName: string): string => {
    const val =
      application.formData?.[fieldName] ??
      application.education?.[fieldName] ??
      application.applicant?.[fieldName] ??
      application[fieldName];
    if (val === undefined || val === null || val === "") return "-";
    // 长文本截断显示
    const str = String(val);
    return str.length > 30 ? str.slice(0, 30) + "…" : str;
  };

  // 过滤和排序逻辑
  const filteredApplications = applications
    .filter((app) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = app.applicant?.name
          ?.toLowerCase()
          .includes(searchLower);
        const emailMatch = app.applicant?.email
          ?.toLowerCase()
          .includes(searchLower);
        const studentIdMatch = app.applicant?.studentId
          ?.toLowerCase()
          .includes(searchLower);
        if (!nameMatch && !emailMatch && !studentIdMatch) {
          return false;
        }
      }
      if (
        filters.minScore &&
        app.aiScore &&
        app.aiScore < parseFloat(filters.minScore)
      ) {
        return false;
      }
      if (
        filters.maxScore &&
        app.aiScore &&
        app.aiScore > parseFloat(filters.maxScore)
      ) {
        return false;
      }
      if (
        filters.major &&
        app.education?.major &&
        !app.education.major.toLowerCase().includes(filters.major.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.grade &&
        app.education?.grade &&
        app.education.grade !== filters.grade
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      switch (filters.sortBy) {
        case "score":
          return (
            ((a.aiScore || 0) > (b.aiScore || 0) ? order : -order) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "name":
          return (
            (a.applicant?.name?.localeCompare(b.applicant?.name || "") || 0) *
            order
          );
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  // 处理选中项变更
  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId],
    );
  };

  // 处理全选
  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === filteredApplications.length
        ? []
        : filteredApplications.map((app) => app.id),
    );
  };

  // 批量状态更新(模拟)
  const handleBulkStatusUpdate = async () => {
    if (!bulkActionStatus || selectedApplications.length === 0) return;

    console.log(
      `批量更新 ${selectedApplications.length} 个申请状态为: ${bulkActionStatus}`,
    );
    // 模拟API调用
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setSelectedApplications([]);
      setBulkActionStatus("");
    }, 1000);
  };

  // 状态标签样式
  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig: Record<
      ApplicationStatus,
      {
        label: string;
        className: string;
        icon: LucideIcon;
      }
    > = {
      submitted: {
        label: "待筛选",
        className: "bg-gray-100 text-gray-700 border border-gray-300",
        icon: Clock,
      },
      screening: {
        label: "筛选中",
        className: "bg-blue-100 text-blue-700 border border-blue-300",
        icon: Star,
      },
      passed: {
        label: "通过筛选",
        className: "bg-green-100 text-green-700 border border-green-300",
        icon: CheckCircle,
      },
      rejected: {
        label: "已拒绝",
        className: "bg-red-100 text-red-700 border border-red-300",
        icon: XCircle,
      },
      interview_scheduled: {
        label: "已安排面试",
        className: "bg-purple-100 text-purple-700 border border-purple-300",
        icon: Clock,
      },
      interview_completed: {
        label: "面试完成",
        className: "bg-amber-100 text-amber-700 border border-amber-300",
        icon: CheckCircle,
      },
      offer_sent: {
        label: "已发offer",
        className: "bg-indigo-100 text-indigo-700 border border-indigo-300",
        icon: CheckCircle,
      },
      accepted: {
        label: "已接受",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-300",
        icon: CheckCircle,
      },
      declined: {
        label: "已婉拒",
        className: "bg-rose-100 text-rose-700 border border-rose-300",
        icon: XCircle,
      },
      archived: {
        label: "已归档",
        className: "bg-slate-100 text-slate-600 border border-slate-300",
        icon: XCircle,
      },
      draft: {
        label: "草稿",
        className: "bg-slate-100 text-slate-600 border border-slate-300",
        icon: Clock,
      },
    };
    return statusConfig[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">
            {error.message || "加载失败，请稍后重试"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            简历筛选
          </h1>
          <p className="mt-2 text-gray-600">
            管理和评估所有申请者简历 - 共 {filteredApplications.length} 个申请
          </p>
        </div>

        {/* 导出按钮 */}
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选工具栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            {/* 基础搜索 */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索申请人姓名、学号或邮箱..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>

              {/* 基础筛选 */}
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={filters.clubId}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, clubId: value }))
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="选择社团" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 动态生成社团选项，按 club.id 去重后渲染 */}
                    {Array.from(
                      new Map(
                        (recruitmentsData?.data ?? []).map((rec: any) => [rec.club.id, rec.club])
                      ).values()
                    ).map((club: any) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: value as ApplicationStatus | "all",
                    }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="submitted">待筛选</SelectItem>
                    <SelectItem value="screening">筛选中</SelectItem>
                    <SelectItem value="passed">通过</SelectItem>
                    <SelectItem value="rejected">拒绝</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  高级筛选
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* 高级筛选面板 */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI评分范围
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="最低分"
                      value={filters.minScore}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minScore: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="最高分"
                      value={filters.maxScore}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxScore: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年级
                  </label>
                  <Select
                    value={filters.grade}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, grade: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="大一">大一</SelectItem>
                      <SelectItem value="大二">大二</SelectItem>
                      <SelectItem value="大三">大三</SelectItem>
                      <SelectItem value="大四">大四</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    专业
                  </label>
                  <Input
                    placeholder="输入专业名称"
                    value={filters.major}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, major: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    技能标签
                  </label>
                  <Input
                    placeholder="输入技能关键词"
                    value={filters.skills}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        skills: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    排序方式
                  </label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, sortBy: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">最新创建</SelectItem>
                      <SelectItem value="score">AI评分</SelectItem>
                      <SelectItem value="name">姓名</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* 批量操作工具栏 */}
        {selectedApplications.length > 0 && (
          <CardContent className="border-t pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedApplications.length ===
                      filteredApplications.length &&
                    filteredApplications.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  已选择 {selectedApplications.length} /{" "}
                  {filteredApplications.length} 个申请
                </span>
              </div>

              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Select
                  value={bulkActionStatus}
                  onValueChange={(value) =>
                    setBulkActionStatus(value as ApplicationStatus)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="批量操作" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passed">批量通过</SelectItem>
                    <SelectItem value="rejected">批量拒绝</SelectItem>
                    <SelectItem value="screening">开始筛选</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleBulkStatusUpdate}
                  disabled={!bulkActionStatus}
                  size="sm"
                >
                  应用操作
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApplications([])}
                >
                  清空选择
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 申请列表 - 表格形式 */}
      {!filters.clubId ? (
        <Card>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                请选择一个社团
              </h3>
              <p className="text-gray-600">
                不同社团的候选人信息字段不一致，请选择一个具体的社团才能查看相关申请
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedApplications.length ===
                              filteredApplications.length &&
                            filteredApplications.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[200px]">申请人</TableHead>
                      {/* 根据招新批次 requiredFields 动态生成列 */}
                      {dynamicColumns.map((col) => (
                        <TableHead
                          key={col.fieldName}
                          className="hidden md:table-cell"
                        >
                          {col.fieldLabel}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">AI评分</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right w-32">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-32 text-center">
                          <div className="text-gray-500">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>暂无申请数据</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((application) => {
                        const statusInfo = getStatusBadge(application.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <TableRow
                            key={application.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedApplications.includes(
                                  application.id,
                                )}
                                onCheckedChange={() =>
                                  handleSelectApplication(application.id)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="text-sm font-semibold">
                                  {application.applicant?.name || "未知"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {application.applicant?.email}
                                </div>
                              </div>
                            </TableCell>
                            {/* 根据 dynamicColumns 动态生成字段值 */}
                            {dynamicColumns.map((col) => (
                              <TableCell
                                key={col.fieldName}
                                className="hidden md:table-cell text-sm text-gray-700 max-w-[160px]"
                              >
                                {getFieldValue(application, col.fieldName)}
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              {application.aiScore != null ? (
                                <Badge
                                  variant="default"
                                  className={`${Number(application.aiScore) >= 80 ? "bg-green-100 text-green-800" : Number(application.aiScore) >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {Number(application.aiScore).toFixed(1)}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  未评分
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 w-fit ${statusInfo.className}`}
                          >
                                <StatusIcon className="h-3 w-3" />
                                <span className="hidden lg:inline">
                                  {statusInfo.label}
                                </span>
                                <span className="lg:hidden">
                                  {statusInfo.label
                                    .replace("筛选", "")
                                    .replace("已", "")
                                    .replace("面试", "面")}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    openDetailModal(application.id)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline ml-1">
                                    详情
                                  </span>
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleSelectApplication(application.id)
                                      }
                                    >
                                      {selectedApplications.includes(
                                        application.id,
                                      )
                                        ? "取消选择"
                                        : "选择"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Star className="mr-2 h-4 w-4" />
                                      开始筛选
                                    </DropdownMenuItem>
                                    {application.status === "submitted" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            /* 通过逻辑 */
                                          }}
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          快速通过
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            /* 拒绝逻辑 */
                                          }}
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          快速拒绝
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 表格底部统计信息 */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-2">
            <div>
              显示 {filteredApplications.length} 条记录
              {filters.search && ` (从 ${applications.length} 条中筛选)`}
            </div>
            <div className="flex gap-4 text-xs">
              <span>
                待筛选:{" "}
                <span className="font-semibold">
                  {
                    applications.filter((app) => app.status === "submitted")
                      .length
                  }
                </span>
              </span>
              <span>
                筛选中:{" "}
                <span className="font-semibold text-blue-600">
                  {
                    applications.filter((app) => app.status === "screening")
                      .length
                  }
                </span>
              </span>
              <span>
                已通过:{" "}
                <span className="font-semibold text-green-600">
                  {applications.filter((app) => app.status === "passed").length}
                </span>
              </span>
              <span>
                已拒绝:{" "}
                <span className="font-semibold text-red-600">
                  {
                    applications.filter((app) => app.status === "rejected")
                      .length
                  }
                </span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* 简历详情模态框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>简历详情</span>
              <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                <XCircle className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : isDetailError || !selectedApplication ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600">
                  {detailError?.message || "加载失败，请稍后重试"}
                </p>
                <Button onClick={closeDetailModal} className="mt-4">
                  关闭
                </Button>
              </div>
            </div>
          ) : (() => {
            const app = selectedApplication as any;
            const applicant = app.applicant || {};
            const education = app.education || {};
            const formData = app.formData || {};
            const skills = app.skills || {};
            const experiences: any[] = app.experiences || [];
            const attachments: any[] = app.attachments || [];

            // 统一取值：formData > education > applicant 顶层
            const getVal = (key: string) =>
              formData[key] ?? education[key] ?? applicant[key] ?? null;

            // 获取该申请对应的招新批次 requiredFields
            const appRecruitment = (recruitmentsData?.data ?? []).find(
              (r) => r.id === app.recruitmentId
            );
            const requiredFields: string[] = appRecruitment?.requiredFields ?? [];
            const customQuestions: any[] = appRecruitment?.customQuestions ?? [];

            // 状态标签
            const STATUS_LABELS: Record<string, string> = {
              submitted: "待筛选", screening: "筛选中", passed: "通过",
              rejected: "拒绝", interview_scheduled: "已安排面试",
              interview_completed: "面试完成", offer_sent: "已发 Offer",
              accepted: "已接受", declined: "已拒绝", archived: "已归档", draft: "草稿",
            };
            const STATUS_COLORS: Record<string, string> = {
              passed: "bg-green-100 text-green-700 border-green-200",
              offer_sent: "bg-blue-100 text-blue-700 border-blue-200",
              accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
              rejected: "bg-red-100 text-red-700 border-red-200",
              declined: "bg-red-100 text-red-700 border-red-200",
              interview_scheduled: "bg-violet-100 text-violet-700 border-violet-200",
              interview_completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
              screening: "bg-yellow-100 text-yellow-700 border-yellow-200",
              submitted: "bg-gray-100 text-gray-700 border-gray-200",
              draft: "bg-gray-100 text-gray-500 border-gray-200",
              archived: "bg-slate-100 text-slate-500 border-slate-200",
            };

            // 基础固定字段（姓名、邮箱 始终展示）
            const BASIC_FIELDS = ["name", "email", "studentId", "phone"];
            // 长文本字段单独成块展示
            const LONG_TEXT_FIELDS = new Set(["experience", "motivation", "resumeText", "selfIntro"]);

            // 从 requiredFields 中筛选出短字段（基础固定字段之外的、非长文本的）
            const shortFields = requiredFields.filter(
              (fn) => !BASIC_FIELDS.includes(fn) && !LONG_TEXT_FIELDS.has(fn)
            );
            // 长文本字段
            const longFields = requiredFields.filter((fn) => LONG_TEXT_FIELDS.has(fn));

            const aiScore = app.aiScore != null ? Number(app.aiScore) : null;
            const analysis = app.aiAnalysis;

            return (
              <div className="space-y-5">
                {/* ── 顶部信息条 ── */}
                <div className="flex items-start justify-between gap-4 pb-2 border-b">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{app.recruitment?.club?.name || "未知社团"}</p>
                    <h2 className="text-lg font-bold text-gray-900">{app.recruitment?.title || "未知招新"}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      申请时间：{app.createdAt ? new Date(app.createdAt).toLocaleDateString("zh-CN") : "-"}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>
                </div>

                {/* ── 申请人基础信息 ── */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">申请人信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      {/* 固定基础字段 */}
                      {[
                        { key: "name", label: "姓名" },
                        { key: "email", label: "邮箱" },
                        { key: "studentId", label: "学号" },
                        { key: "phone", label: "电话" },
                      ].map(({ key, label }) => {
                        const val = getVal(key);
                        if (!val) return null;
                        return (
                          <div key={key} className="flex justify-between gap-2">
                            <span className="text-gray-500 flex-shrink-0">{label}</span>
                            <span className="text-gray-900 text-right">{val}</span>
                          </div>
                        );
                      })}
                      {/* 招新批次 requiredFields 中的短字段 */}
                      {shortFields.map((fn) => {
                        const val = getVal(fn);
                        if (!val) return null;
                        return (
                          <div key={fn} className="flex justify-between gap-2">
                            <span className="text-gray-500 flex-shrink-0">{getFieldLabel(fn)}</span>
                            <span className="text-gray-900 text-right">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* ── 长文本申请内容（相关经验、申请动机等）── */}
                {longFields.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">申请内容</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {longFields.map((fn) => {
                        const val = getVal(fn);
                        if (!val) return null;
                        return (
                          <div key={fn}>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1.5">{getFieldLabel(fn)}</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">{val}</p>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* ── 自定义问题答案 ── */}
                {customQuestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">问卷回答</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customQuestions.map((q: any, idx: number) => {
                        const answer = formData[`custom_${idx}`] ?? formData[q.question] ?? null;
                        return (
                          <div key={idx}>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1.5">
                              {q.question}
                              {q.required && <span className="text-red-500 ml-1">*</span>}
                            </h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                              {answer ?? <span className="text-gray-400 italic">未作答</span>}
                            </p>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* ── 技能 ── */}
                {(skills.languages?.length > 0 || skills.frameworks?.length > 0 || skills.tools?.length > 0) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">技能</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "编程语言", items: skills.languages },
                        { label: "框架 / 库", items: skills.frameworks },
                        { label: "工具", items: skills.tools },
                      ].map(({ label, items }) =>
                        items?.length > 0 ? (
                          <div key={label}>
                            <p className="text-xs text-gray-400 mb-1.5">{label}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((s: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ── 经历 ── */}
                {experiences.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">经历</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {experiences.map((exp: any, idx: number) => (
                          <div key={idx} className="border-l-4 border-blue-400 pl-4 py-1">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm text-gray-900">{exp.name || exp.title || "未命名"}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {exp.year ?? (exp.startDate ? new Date(exp.startDate).getFullYear() : "")}
                              </span>
                            </div>
                            {exp.type && (
                              <p className="text-xs text-gray-500 mt-0.5">{exp.type}</p>
                            )}
                            {exp.description && (
                              <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                            )}
                            {exp.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {exp.skills.map((s: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── 简历原文 ── */}
                {app.resumeText && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">简历原文</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3">{app.resumeText}</p>
                    </CardContent>
                  </Card>
                )}

                {/* ── 附件 ── */}
                {attachments.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">附件</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {attachments.map((att: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-blue-500">📄</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{att.originalName || att.filename}</p>
                                {att.description && <p className="text-xs text-gray-400">{att.description}</p>}
                              </div>
                            </div>
                            <Button variant="outline" size="sm">预览</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── AI 分析 ── */}
                {aiScore !== null && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        AI 评分
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 评分圆形进度感 */}
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${aiScore >= 80 ? "text-green-600" : aiScore >= 60 ? "text-orange-500" : "text-red-500"}`}>
                          {aiScore.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-sm">/ 100</span>
                        <Badge className={`ml-2 ${aiScore >= 80 ? "bg-green-100 text-green-700" : aiScore >= 60 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                          {aiScore >= 80 ? "优秀" : aiScore >= 60 ? "合格" : "待提升"}
                        </Badge>
                      </div>
                      {analysis && typeof analysis === "object" && (
                        <div className="space-y-3">
                          {analysis.summary && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">总结</p>
                              <p className="text-sm text-gray-700">{analysis.summary}</p>
                            </div>
                          )}
                          {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">优势</p>
                              <ul className="space-y-1">
                                {analysis.strengths.map((s: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">建议</p>
                              <ul className="space-y-1">
                                {analysis.suggestions.map((s: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <Star className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {analysis && typeof analysis === "string" && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{analysis}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
