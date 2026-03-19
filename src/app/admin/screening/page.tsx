"use client";

import { useState, useEffect } from "react";
import {
  useApplications,
  useApplicationDetail,
  useUpdateApplicationStatus,
  useTriggerAiEvaluate,
} from "@/hooks/use-applications";
import { usePermissions } from "@/hooks/use-permissions";
import { useQueryClient } from "@tanstack/react-query";
import { useRegistrationFields } from "@/hooks/use-registration-fields";
import { useRecruitments } from "@/hooks/use-recruitment";
import {
  Card,
  CardContent,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  FileText,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { ApplicationStatus } from "@/lib/api/applications/types";
import { filesApi } from "@/lib/api/files";

// ─── 状态流转规则 ───────────────────────────────────────────────
// 根据当前状态，返回管理员可以流转到的目标状态列表
const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: [],
  submitted: ["screening", "rejected", "archived"],
  screening: ["passed", "rejected", "archived"],
  passed: ["interview_scheduled", "rejected", "archived"],
  interview_scheduled: ["interview_completed", "rejected", "archived"],
  interview_completed: ["offer_sent", "rejected", "archived"],
  offer_sent: ["accepted", "declined", "archived"],
  accepted: ["archived"],
  declined: ["archived"],
  rejected: ["archived"],
  archived: [],
};

// 状态的中文标签
const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "草稿",
  submitted: "待筛选",
  screening: "筛选中",
  passed: "通过筛选",
  rejected: "已拒绝",
  interview_scheduled: "已安排面试",
  interview_completed: "面试完成",
  offer_sent: "已发 Offer",
  accepted: "已接受",
  declined: "已婉拒",
  archived: "已归档",
};

// 状态对应的 Badge 样式
const STATUS_STYLES: Record<ApplicationStatus, { className: string; icon: LucideIcon }> = {
  submitted:           { className: "bg-gray-100 text-gray-700 border-gray-300",       icon: Clock },
  screening:           { className: "bg-blue-100 text-blue-700 border-blue-300",        icon: Star },
  passed:              { className: "bg-green-100 text-green-700 border-green-300",     icon: CheckCircle },
  rejected:            { className: "bg-red-100 text-red-700 border-red-300",           icon: XCircle },
  interview_scheduled: { className: "bg-purple-100 text-purple-700 border-purple-300", icon: Clock },
  interview_completed: { className: "bg-amber-100 text-amber-700 border-amber-300",    icon: CheckCircle },
  offer_sent:          { className: "bg-indigo-100 text-indigo-700 border-indigo-300", icon: CheckCircle },
  accepted:            { className: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: CheckCircle },
  declined:            { className: "bg-rose-100 text-rose-700 border-rose-300",       icon: XCircle },
  archived:            { className: "bg-slate-100 text-slate-600 border-slate-300",    icon: XCircle },
  draft:               { className: "bg-slate-100 text-slate-600 border-slate-300",    icon: Clock },
};

// 操作按钮文案
const ACTION_LABELS: Partial<Record<ApplicationStatus, string>> = {
  screening: "开始筛选",
  passed: "通过筛选",
  rejected: "拒绝",
  interview_scheduled: "安排面试",
  interview_completed: "完成面试",
  offer_sent: "发送 Offer",
  accepted: "标记接受",
  declined: "标记婉拒",
  archived: "归档",
};

/**
 * 简历筛选页面（表格版）
 * 管理员可以高效地管理和评估大量申请者简历
 */
export default function ResumeScreeningPage() {
  usePermissions(); // 保留权限上下文

  // ─── 筛选状态 ───────────────────────────────────────────────
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as ApplicationStatus | "all",
    recruitmentId: "",
    clubId: "",
    minScore: "",
    maxScore: "",
    grade: "",
    major: "",
    skills: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [bulkActionStatus, setBulkActionStatus] = useState<ApplicationStatus | "">("");

  // ─── 详情弹窗 ───────────────────────────────────────────────
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ─── 状态流转确认弹窗 ────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    applicationId: string;
    targetStatus: ApplicationStatus;
    comment: string;
  }>({ open: false, applicationId: "", targetStatus: "screening", comment: "" });

  // ─── 批量操作确认弹窗 ────────────────────────────────────────
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  // ─── 数据获取 ────────────────────────────────────────────────
  const { data: allRegistrationFields = [] } = useRegistrationFields();
  const { data: recruitmentsData } = useRecruitments();

  // 自动默认选中第一个社团
  useEffect(() => {
    if (!recruitmentsData?.data?.length) return;
    setFilters((prev) => {
      if (prev.clubId) return prev;
      const firstClubId = recruitmentsData.data[0].club?.id;
      if (!firstClubId) return prev;
      return { ...prev, clubId: firstClubId };
    });
  }, [recruitmentsData]);

  const { data, isLoading, error } = useApplications({
    status: filters.status !== "all" ? filters.status : undefined,
    recruitmentId: filters.recruitmentId || undefined,
    clubId: filters.clubId || undefined,
    page: 1,
    limit: 100,
  });

  const { data: selectedApplication, isLoading: isDetailLoading, isError: isDetailError, error: detailError } =
    useApplicationDetail(selectedApplicationId || "");

  // ─── Mutation ────────────────────────────────────────────────
  const updateStatusMutation = useUpdateApplicationStatus();
  const triggerAiEvaluateMutation = useTriggerAiEvaluate();

  // ─── 字段映射 ────────────────────────────────────────────────
  const fieldLabelMap = Object.fromEntries(
    allRegistrationFields.map((f) => [f.fieldName, f.fieldLabel])
  );
  const FALLBACK_LABELS: Record<string, string> = {
    name: "姓名", studentId: "学号", phone: "电话", email: "邮箱",
    college: "学院", major: "专业", grade: "年级",
    experience: "相关经验", motivation: "申请动机",
  };
  const getFieldLabel = (fieldName: string) =>
    fieldLabelMap[fieldName] || FALLBACK_LABELS[fieldName] || fieldName;

  // ─── 动态列 ──────────────────────────────────────────────────
  const LONG_TEXT_FIELDS = new Set(["experience", "motivation", "resumeText", "selfIntro", "description"]);

  const dynamicColumns: { fieldName: string; fieldLabel: string }[] = (() => {
    const allRecruitments = recruitmentsData?.data ?? [];
    let requiredFieldNames: string[] = [];
    if (filters.recruitmentId) {
      const rec = allRecruitments.find((r) => r.id === filters.recruitmentId);
      requiredFieldNames = rec?.requiredFields ?? [];
    } else if (filters.clubId) {
      const seen = new Set<string>();
      allRecruitments
        .filter((r) => r.club.id === filters.clubId)
        .forEach((r) => (r.requiredFields ?? []).forEach((fn) => seen.add(fn)));
      requiredFieldNames = Array.from(seen);
    }
    return requiredFieldNames
      .filter((fn) => fn !== "name" && !LONG_TEXT_FIELDS.has(fn))
      .map((fn) => ({ fieldName: fn, fieldLabel: getFieldLabel(fn) }));
  })();

  const getFieldValue = (application: any, fieldName: string): string => {
    const val =
      application.formData?.[fieldName] ??
      application.education?.[fieldName] ??
      application.applicant?.[fieldName] ??
      application[fieldName];
    if (val === undefined || val === null || val === "") return "-";
    const str = String(val);
    return str.length > 30 ? str.slice(0, 30) + "…" : str;
  };

  // ─── 过滤排序 ────────────────────────────────────────────────
  const applications = data?.applications || [];
  const filteredApplications = applications
    .filter((app) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (
          !app.applicant?.name?.toLowerCase().includes(s) &&
          !app.applicant?.email?.toLowerCase().includes(s) &&
          !(app.applicant as any)?.studentId?.toLowerCase().includes(s)
        ) return false;
      }
      if (filters.minScore && app.aiScore != null && app.aiScore < parseFloat(filters.minScore)) return false;
      if (filters.maxScore && app.aiScore != null && app.aiScore > parseFloat(filters.maxScore)) return false;
      if (filters.major && (app as any).education?.major &&
        !(app as any).education.major.toLowerCase().includes(filters.major.toLowerCase())) return false;
      if (filters.grade && (app as any).education?.grade &&
        (app as any).education.grade !== filters.grade) return false;
      return true;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "score") {
        return ((a.aiScore || 0) > (b.aiScore || 0) ? order : -order);
      }
      if (filters.sortBy === "name") {
        return (a.applicant?.name?.localeCompare(b.applicant?.name || "") || 0) * order;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // ─── 操作处理 ────────────────────────────────────────────────
  const openStatusConfirm = (applicationId: string, targetStatus: ApplicationStatus) => {
    setConfirmDialog({ open: true, applicationId, targetStatus, comment: "" });
  };

  const handleConfirmStatusChange = async () => {
    const { applicationId, targetStatus, comment } = confirmDialog;
    try {
      await updateStatusMutation.mutateAsync({
        id: applicationId,
        data: { status: targetStatus, comment: comment || undefined },
      });
      toast.success(`状态已更新为「${STATUS_LABELS[targetStatus]}」`);
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      // 如果详情弹窗也打开了，不关闭它，但数据会自动刷新
    } catch (err: any) {
      toast.error(err?.message || "状态更新失败，请稍后重试");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkActionStatus || selectedApplications.length === 0) return;
    setBulkConfirmOpen(false);
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedApplications) {
      try {
        await updateStatusMutation.mutateAsync({
          id,
          data: { status: bulkActionStatus },
        });
        successCount++;
      } catch {
        failCount++;
      }
    }
    if (successCount > 0) {
      toast.success(`已成功更新 ${successCount} 条申请状态`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} 条申请更新失败`);
    }
    queryClient.invalidateQueries({ queryKey: ["applications"] });
    setSelectedApplications([]);
    setBulkActionStatus("");
  };

  const handleSelectApplication = (id: string) => {
    setSelectedApplications((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === filteredApplications.length
        ? []
        : filteredApplications.map((app) => app.id)
    );
  };

  const openDetailModal = (id: string) => {
    setSelectedApplicationId(id);
    setIsDetailOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedApplicationId(null), 300);
  };

  // ─── 加载 / 错误状态 ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-600">{error.message || "加载失败，请稍后重试"}</p>
      </div>
    );
  }

  // ─── 渲染 ─────────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">简历筛选</h1>
          <p className="mt-2 text-gray-600">
            管理和评估所有申请者简历 - 共 {filteredApplications.length} 个申请
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出数据
        </Button>
      </div>

      {/* 筛选工具栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索申请人姓名、学号或邮箱..."
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* 社团筛选 */}
                <Select
                  value={filters.clubId}
                  onValueChange={(v) => setFilters((p) => ({ ...p, clubId: v, recruitmentId: "" }))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="选择社团" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Map(
                        (recruitmentsData?.data ?? []).map((r: any) => [r.club.id, r.club])
                      ).values()
                    ).map((club: any) => (
                      <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 状态筛选 */}
                <Select
                  value={filters.status}
                  onValueChange={(v) => setFilters((p) => ({ ...p, status: v as ApplicationStatus | "all" }))}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  高级筛选
                  {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 高级筛选 */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI评分范围</label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="最低" value={filters.minScore}
                      onChange={(e) => setFilters((p) => ({ ...p, minScore: e.target.value }))} />
                    <Input type="number" placeholder="最高" value={filters.maxScore}
                      onChange={(e) => setFilters((p) => ({ ...p, maxScore: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                  <Select value={filters.grade} onValueChange={(v) => setFilters((p) => ({ ...p, grade: v }))}>
                    <SelectTrigger><SelectValue placeholder="选择年级" /></SelectTrigger>
                    <SelectContent>
                      {["大一","大二","大三","大四"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">专业</label>
                  <Input placeholder="输入专业名称" value={filters.major}
                    onChange={(e) => setFilters((p) => ({ ...p, major: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">技能标签</label>
                  <Input placeholder="输入技能关键词" value={filters.skills}
                    onChange={(e) => setFilters((p) => ({ ...p, skills: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                  <Select value={filters.sortBy} onValueChange={(v) => setFilters((p) => ({ ...p, sortBy: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
              <span className="text-sm font-medium">
                已选择 {selectedApplications.length} / {filteredApplications.length} 个申请
              </span>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Select
                  value={bulkActionStatus}
                  onValueChange={(v) => setBulkActionStatus(v as ApplicationStatus)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="选择批量操作" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screening">批量开始筛选</SelectItem>
                    <SelectItem value="passed">批量通过筛选</SelectItem>
                    <SelectItem value="rejected">批量拒绝</SelectItem>
                    <SelectItem value="archived">批量归档</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setBulkConfirmOpen(true)}
                  disabled={!bulkActionStatus || updateStatusMutation.isPending}
                  size="sm"
                >
                  应用操作
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedApplications([])}>
                  清空选择
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 申请列表 */}
      {!filters.clubId ? (
        <Card>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">请选择一个社团</h3>
              <p className="text-gray-600">不同社团的候选人信息字段不一致，请选择一个具体的社团才能查看相关申请</p>
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
                            selectedApplications.length === filteredApplications.length &&
                            filteredApplications.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[200px]">申请人</TableHead>
                      {dynamicColumns.map((col) => (
                        <TableHead key={col.fieldName} className="hidden md:table-cell">
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
                        <TableCell colSpan={6 + dynamicColumns.length} className="h-32 text-center">
                          <div className="text-gray-500">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>暂无申请数据</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((application) => {
                        const statusStyle = STATUS_STYLES[application.status];
                        const StatusIcon = statusStyle.icon;
                        const transitions = TRANSITIONS[application.status] ?? [];

                        return (
                          <TableRow key={application.id} className="hover:bg-gray-50">
                            <TableCell>
                              <Checkbox
                                checked={selectedApplications.includes(application.id)}
                                onCheckedChange={() => handleSelectApplication(application.id)}
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
                            {dynamicColumns.map((col) => (
                              <TableCell key={col.fieldName} className="hidden md:table-cell text-sm text-gray-700 max-w-[160px]">
                                {getFieldValue(application, col.fieldName)}
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              {application.aiScore != null ? (
                                <Badge
                                  variant="default"
                                  className={
                                    Number(application.aiScore) >= 80
                                      ? "bg-green-100 text-green-800"
                                      : Number(application.aiScore) >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {Number(application.aiScore).toFixed(1)}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">未评分</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`flex items-center gap-1 w-fit ${statusStyle.className}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {STATUS_LABELS[application.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDetailModal(application.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline ml-1">详情</span>
                                </Button>

                                {transitions.length > 0 && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {transitions.map((target, idx) => {
                                        const isDestructive = target === "rejected" || target === "archived";
                                        const isDanger = target === "declined";
                                        return (
                                          <div key={target}>
                                            {idx > 0 && isDestructive && transitions[idx - 1] !== "rejected" && transitions[idx - 1] !== "archived" && (
                                              <DropdownMenuSeparator />
                                            )}
                                            <DropdownMenuItem
                                              onClick={() => openStatusConfirm(application.id, target)}
                                              className={
                                                isDestructive || isDanger
                                                  ? "text-red-600 focus:text-red-600"
                                                  : ""
                                              }
                                            >
                                              {ACTION_LABELS[target] || STATUS_LABELS[target]}
                                            </DropdownMenuItem>
                                          </div>
                                        );
                                      })}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
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

          {/* 底部统计 */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-2">
            <div>
              显示 {filteredApplications.length} 条记录
              {filters.search && ` (从 ${applications.length} 条中筛选)`}
            </div>
            <div className="flex gap-4 text-xs">
              {(["submitted","screening","passed","rejected"] as ApplicationStatus[]).map((s) => (
                <span key={s}>
                  {STATUS_LABELS[s]}:{" "}
                  <span className="font-semibold">
                    {applications.filter((a) => a.status === s).length}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── 状态流转确认弹窗 ─────────────────────────────────── */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((p) => ({ ...p, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认操作：{ACTION_LABELS[confirmDialog.targetStatus] || STATUS_LABELS[confirmDialog.targetStatus]}
            </AlertDialogTitle>
            <AlertDialogDescription>
              将把该申请状态更新为「{STATUS_LABELS[confirmDialog.targetStatus]}」，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 py-2">
            <Label className="text-sm font-medium">备注（可选）</Label>
            <Textarea
              className="mt-1.5"
              placeholder="填写本次操作的原因或备注..."
              value={confirmDialog.comment}
              onChange={(e) =>
                setConfirmDialog((p) => ({ ...p, comment: e.target.value }))
              }
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              disabled={updateStatusMutation.isPending}
              className={
                confirmDialog.targetStatus === "rejected" || confirmDialog.targetStatus === "archived"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {updateStatusMutation.isPending ? "处理中..." : "确认"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── 批量操作确认弹窗 ─────────────────────────────────── */}
      <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量操作</AlertDialogTitle>
            <AlertDialogDescription>
              将对 <strong>{selectedApplications.length}</strong> 条申请执行「
              {bulkActionStatus ? STATUS_LABELS[bulkActionStatus] : ""}」操作，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkStatusUpdate}
              disabled={updateStatusMutation.isPending}
              className={
                bulkActionStatus === "rejected" || bulkActionStatus === "archived"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {updateStatusMutation.isPending ? "处理中..." : "确认执行"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── 简历详情弹窗 ─────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>简历详情</DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : isDetailError || !selectedApplication ? (
            <div className="text-center py-12">
              <p className="text-red-600">{detailError?.message || "加载失败，请稍后重试"}</p>
              <Button onClick={closeDetailModal} className="mt-4">关闭</Button>
            </div>
          ) : (() => {
            const app = selectedApplication as any;
            const applicant = app.applicant || {};
            const education = app.education || {};
            const formData = app.formData || {};
            const skills = app.skills || {};
            const experiences: any[] = app.experiences || [];
            // 后端返回字段为 files（含 viewUrl/downloadUrl），兼容旧字段 attachments
            const attachments: any[] = app.files || app.attachments || [];

            const getVal = (key: string) =>
              formData[key] ?? education[key] ?? applicant[key] ?? null;

            const appRecruitment = (recruitmentsData?.data ?? []).find(
              (r) => r.id === app.recruitmentId
            );
            const requiredFields: string[] = appRecruitment?.requiredFields ?? [];
            const customQuestions: any[] = appRecruitment?.customQuestions ?? [];

            const BASIC_FIELDS = ["name", "email", "studentId", "phone"];
            const shortFields = requiredFields.filter(
              (fn) => !BASIC_FIELDS.includes(fn) && !LONG_TEXT_FIELDS.has(fn)
            );
            const longFields = requiredFields.filter((fn) => LONG_TEXT_FIELDS.has(fn));

            const aiScore = app.aiScore != null ? Number(app.aiScore) : null;
            const analysis = app.aiAnalysis;
            const detailTransitions = TRANSITIONS[app.status as ApplicationStatus] ?? [];

            return (
              <div className="space-y-5">
                {/* 顶部信息条 */}
                <div className="flex items-start justify-between gap-4 pb-2 border-b">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{app.recruitment?.club?.name || "未知社团"}</p>
                    <h2 className="text-lg font-bold text-gray-900">{app.recruitment?.title || "未知招新"}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      申请时间：{app.createdAt ? new Date(app.createdAt).toLocaleDateString("zh-CN") : "-"}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[app.status as ApplicationStatus]?.className ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
                  </span>
                </div>

                {/* 状态流转操作栏 */}
                {detailTransitions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded-lg border">
                    <span className="text-sm font-medium text-gray-700 mr-1">操作：</span>
                    {detailTransitions.map((target) => {
                      const isDestructive = target === "rejected" || target === "archived" || target === "declined";
                      return (
                        <Button
                          key={target}
                          size="sm"
                          variant={isDestructive ? "outline" : "default"}
                          className={isDestructive ? "border-red-200 text-red-600 hover:bg-red-50" : ""}
                          disabled={updateStatusMutation.isPending}
                          onClick={() => {
                            closeDetailModal();
                            openStatusConfirm(app.id, target);
                          }}
                        >
                          {ACTION_LABELS[target] || STATUS_LABELS[target]}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* 申请人基础信息 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">申请人信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
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

                {/* 长文本申请内容 */}
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

                {/* 自定义问题 */}
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

                {/* 技能 */}
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

                {/* 经历 */}
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
                            {exp.type && <p className="text-xs text-gray-500 mt-0.5">{exp.type}</p>}
                            {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
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

                {/* 简历原文 */}
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

                {/* 附件文件 */}
                {attachments.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">附件文件</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {attachments.map((att: any, idx: number) => {
                          const FILE_TYPE_LABELS: Record<string, string> = {
                            resume: "简历", portfolio: "作品集",
                            certificate: "证书", avatar: "头像", other: "其他",
                          };
                          const canPreview = att.previewable ?? filesApi.isPreviewable(att.mimeType ?? "");
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {att.originalName || att.filename}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {att.description && <>{att.description} · </>}
                                    {FILE_TYPE_LABELS[att.fileType] ?? att.fileType ?? att.type ?? "文件"}
                                    {att.size && <> · {filesApi.formatSize(att.size)}</>}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {canPreview && att.viewUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(att.viewUrl, "_blank")}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    预览
                                  </Button>
                                )}
                                {att.downloadUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      filesApi
                                        .download(att.fileId, att.originalName)
                                        .catch((e) => console.error("下载失败:", e))
                                    }
                                  >
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                    下载
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI 分析 */}
                {(() => {
                  const isThisPolling = triggerAiEvaluateMutation.isPollingFor(app.id);
                  const isThisPending = triggerAiEvaluateMutation.isPending && triggerAiEvaluateMutation.variables === app.id;
                  const isWorking = isThisPending || isThisPolling;

                  const btnLabel = isThisPending
                    ? "触发中..."
                    : isThisPolling
                    ? "分析中..."
                    : aiScore !== null
                    ? "重新评估"
                    : "立即评估";

                  return (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className={`h-4 w-4 ${isWorking ? "text-yellow-400 animate-pulse" : "text-yellow-500"}`} />
                        AI 评估
                        {isWorking && (
                          <span className="text-xs font-normal text-gray-400 animate-pulse">正在分析中...</span>
                        )}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isWorking}
                        onClick={() => {
                          triggerAiEvaluateMutation.mutate(app.id, {
                            onSuccess: () => toast.success("AI 评估已触发，结果将在约 10 秒后更新"),
                            onError: (err: any) => toast.error(err?.message || "触发失败，请稍后重试"),
                          });
                        }}
                      >
                        {isWorking ? (
                          <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />{btnLabel}</>
                        ) : (
                          <><Sparkles className="h-3.5 w-3.5 mr-1" />{btnLabel}</>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 轮询等待中：骨架屏占位 */}
                    {isWorking ? (
                      <div className="space-y-3 animate-pulse">
                        {/* 评分骨架 */}
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-12 bg-gray-200 rounded" />
                          <div className="h-4 w-8 bg-gray-100 rounded" />
                          <div className="h-5 w-14 bg-gray-200 rounded-full" />
                          <div className="h-5 w-16 bg-gray-100 rounded-full ml-auto" />
                        </div>
                        {/* 维度分骨架 */}
                        <div className="grid grid-cols-2 gap-2">
                          {[1,2,3,4].map((i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-2.5 space-y-2">
                              <div className="flex justify-between">
                                <div className="h-3 w-14 bg-gray-200 rounded" />
                                <div className="h-3 w-6 bg-gray-200 rounded" />
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full" />
                            </div>
                          ))}
                        </div>
                        {/* 总结骨架 */}
                        <div className="space-y-1.5 bg-blue-50 rounded-lg px-3 py-2">
                          <div className="h-3 w-full bg-blue-100 rounded" />
                          <div className="h-3 w-4/5 bg-blue-100 rounded" />
                        </div>
                        {/* 优势骨架 */}
                        <div className="space-y-1.5">
                          <div className="h-3 w-10 bg-gray-200 rounded" />
                          {[1,2].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="h-3.5 w-3.5 bg-gray-200 rounded-full flex-shrink-0" />
                              <div className="h-3 bg-gray-100 rounded" style={{ width: `${60 + i * 15}%` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : aiScore === null ? (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                        <Sparkles className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-sm">暂无 AI 评估结果</p>
                        <p className="text-xs mt-1">点击右上角「立即评估」触发分析</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* 评分 + 推荐标签 */}
                        <div className="flex items-center gap-3">
                          <span className={`text-3xl font-bold ${aiScore >= 80 ? "text-green-600" : aiScore >= 60 ? "text-orange-500" : "text-red-500"}`}>
                            {aiScore.toFixed(0)}
                          </span>
                          <span className="text-gray-400 text-sm self-end mb-1">/ 100</span>
                          <Badge className={`ml-1 ${aiScore >= 80 ? "bg-green-100 text-green-700" : aiScore >= 60 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                            {aiScore >= 80 ? "优秀" : aiScore >= 60 ? "合格" : "待提升"}
                          </Badge>
                          {analysis?.recommendation && (
                            <Badge variant="outline" className={`ml-auto ${
                              analysis.recommendation === "strongly_recommend" ? "border-green-400 text-green-700" :
                              analysis.recommendation === "recommend" ? "border-blue-400 text-blue-700" :
                              analysis.recommendation === "pending" ? "border-yellow-400 text-yellow-700" :
                              "border-red-400 text-red-700"
                            }`}>
                              {analysis.recommendation === "strongly_recommend" ? "强烈推荐" :
                               analysis.recommendation === "recommend" ? "推荐" :
                               analysis.recommendation === "pending" ? "待定" : "不推荐"}
                            </Badge>
                          )}
                        </div>

                        {/* 维度分 */}
                        {analysis?.details && (
                          <div className="grid grid-cols-2 gap-2">
                            {([
                              { key: "motivation", label: "动机热情" },
                              { key: "experience", label: "相关经验" },
                              { key: "skills",     label: "技能匹配" },
                              { key: "expression", label: "表达能力" },
                            ] as const).map(({ key, label }) => {
                              const val = analysis.details[key] as number;
                              return (
                                <div key={key} className="bg-gray-50 rounded-lg p-2.5">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">{label}</span>
                                    <span className={`text-xs font-semibold ${
                                      val >= 80 ? "text-green-600" : val >= 60 ? "text-orange-500" : "text-red-500"
                                    }`}>{val}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        val >= 80 ? "bg-green-500" : val >= 60 ? "bg-orange-400" : "bg-red-400"
                                      }`}
                                      style={{ width: `${val}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 总结 */}
                        {analysis?.summary && (
                          <p className="text-sm text-gray-700 bg-blue-50 rounded-lg px-3 py-2 border-l-2 border-blue-300">
                            {analysis.summary}
                          </p>
                        )}

                        {/* 优势 */}
                        {Array.isArray(analysis?.strengths) && analysis.strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">优势</p>
                            <ul className="space-y-1">
                              {analysis.strengths.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 不足 */}
                        {Array.isArray(analysis?.weaknesses) && analysis.weaknesses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">不足</p>
                            <ul className="space-y-1">
                              {analysis.weaknesses.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                  );
                })()}

                {/* 状态历史 */}
                {app.statusHistory?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">操作历史</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {app.statusHistory.map((h: any) => (
                          <div key={h.id} className="flex items-start gap-3 text-sm">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_STYLES[h.status as ApplicationStatus]?.className.split(" ")[0] ?? "bg-gray-300"}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-gray-900">
                                  {STATUS_LABELS[h.status as ApplicationStatus] ?? h.status}
                                </span>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {new Date(h.changedAt).toLocaleString("zh-CN")}
                                </span>
                              </div>
                              {h.comment && (
                                <p className="text-gray-500 mt-0.5 truncate">{h.comment}</p>
                              )}
                              {h.changedBy?.name && (
                                <p className="text-xs text-gray-400 mt-0.5">操作人：{h.changedBy.name}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
