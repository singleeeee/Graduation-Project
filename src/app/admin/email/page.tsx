"use client";

import { useState, useCallback } from "react";
import {
  Mail,
  Send,
  FileText,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  useEmailLogs,
  useEmailLogDetail,
  usePreviewRecipients,
  useSendEmail,
} from "@/hooks/use-email";
import { useClubsForSelection, useRecruitments } from "@/hooks/use-recruitment";
import type {
  RecipientFilterType,
  EmailTemplate,
  EmailLog,
} from "@/lib/api/email/types";

// ─── Tab 类型 ────────────────────────────────────────────────────────────────

type TabKey = "compose" | "templates" | "logs";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "compose", label: "发送邮件", icon: <Send className="h-4 w-4" /> },
  { key: "templates", label: "模板管理", icon: <FileText className="h-4 w-4" /> },
  { key: "logs", label: "发送记录", icon: <Clock className="h-4 w-4" /> },
];

// ─── 状态徽章 ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EmailLog["status"] }) {
  const map = {
    pending: { label: "等待中", variant: "secondary" as const },
    sending: { label: "发送中", variant: "default" as const },
    done: { label: "已完成", variant: "default" as const },
    failed: { label: "失败", variant: "destructive" as const },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "secondary" as const };
  return (
    <Badge
      variant={variant}
      className={status === "done" ? "bg-green-100 text-green-700 border-green-200" : ""}
    >
      {label}
    </Badge>
  );
}

// ─── 收件人筛选器 ─────────────────────────────────────────────────────────────

interface RecipientSelectorProps {
  filterType: RecipientFilterType;
  filterParams: Record<string, string>;
  onFilterTypeChange: (v: RecipientFilterType) => void;
  onFilterParamChange: (key: string, value: string) => void;
}

function RecipientSelector({
  filterType,
  filterParams,
  onFilterTypeChange,
  onFilterParamChange,
}: RecipientSelectorProps) {
  const { mutate: preview, data: previewData, isPending: previewing } = usePreviewRecipients();
  const { data: clubs = [], isLoading: clubsLoading } = useClubsForSelection();
  const recruitments = useRecruitments({ limit: 100 });
  const recruitmentList: any[] = Array.isArray(recruitments.data)
    ? recruitments.data
    : (recruitments.data as any)?.data ?? [];

  const APPLICATION_STATUSES = [
    { value: "draft", label: "草稿" },
    { value: "submitted", label: "已提交" },
    { value: "reviewing", label: "审核中" },
    { value: "interview", label: "面试中" },
    { value: "accepted", label: "已录取" },
    { value: "rejected", label: "已拒绝" },
  ];

  const handlePreview = () => {
    preview({
      filterType,
      filterParams: filterType === "specific"
        ? { emails: filterParams.emails?.split(",").map((e) => e.trim()).filter(Boolean) }
        : filterType === "by_status"
        ? { status: filterParams.status }
        : filterType === "by_recruitment"
        ? { recruitmentId: filterParams.recruitmentId }
        : filterType === "by_club"
        ? { clubId: filterParams.clubId }
        : {},
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterType} onValueChange={(v) => onFilterTypeChange(v as RecipientFilterType)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="选择收件人范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部用户</SelectItem>
            <SelectItem value="specific">指定邮箱</SelectItem>
            <SelectItem value="by_status">按申请状态</SelectItem>
            <SelectItem value="by_recruitment">按招新批次</SelectItem>
            <SelectItem value="by_club">按社团</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={previewing}
          className="flex items-center gap-1.5"
        >
          {previewing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Users className="h-3.5 w-3.5" />
          )}
          预览收件人
        </Button>

        {previewData && (
          <span className="text-sm text-gray-600">
            共 <span className="font-semibold text-blue-600">{previewData.count}</span> 位收件人
            {previewData.hasMore && "（仅显示前10位）"}
          </span>
        )}
      </div>

      {/* 条件参数输入 */}
      {filterType === "specific" && (
        <div>
          <Input
            placeholder="输入邮箱地址，多个用英文逗号分隔"
            value={filterParams.emails ?? ""}
            onChange={(e) => onFilterParamChange("emails", e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">例：user1@example.com, user2@example.com</p>
        </div>
      )}

      {filterType === "by_status" && (
        <Select
          value={filterParams.status ?? "placeholder"}
          onValueChange={(v) => onFilterParamChange("status", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="请选择申请状态" />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {filterType === "by_recruitment" && (
        <Select
          value={filterParams.recruitmentId ?? "placeholder"}
          onValueChange={(v) => onFilterParamChange("recruitmentId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="请选择招新批次" />
          </SelectTrigger>
          <SelectContent>
            {recruitmentList.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">暂无招新批次</div>
            ) : (
              recruitmentList.map((r: any) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title ?? r.name ?? r.id}
                  {r.status && (
                    <span className="ml-1.5 text-xs text-gray-400">
                      ({r.status === "active" ? "进行中" : r.status === "closed" ? "已结束" : r.status})
                    </span>
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}

      {filterType === "by_club" && (
        <Select
          value={filterParams.clubId ?? "placeholder"}
          onValueChange={(v) => onFilterParamChange("clubId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={clubsLoading ? "加载中..." : "请选择社团"} />
          </SelectTrigger>
          <SelectContent>
            {clubs.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                {clubsLoading ? "加载中..." : "暂无社团"}
              </div>
            ) : (
              clubs.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                  {c.category && (
                    <span className="ml-1.5 text-xs text-gray-400">({c.category})</span>
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}

      {/* 预览列表 */}
      {previewData && previewData.preview.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500 mb-2">收件人预览</p>
          <div className="flex flex-wrap gap-1.5">
            {previewData.preview.map((r) => (
              <span
                key={r.email}
                className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-700"
              >
                {r.name && <span className="font-medium">{r.name}</span>}
                <span className="text-gray-400">{r.email}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 富文本编辑器（简易版） ───────────────────────────────────────────────────

interface RichEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function RichEditor({ value, onChange, placeholder, minHeight = "200px" }: RichEditorProps) {
  const insertTag = (open: string, close: string) => {
    const ta = document.getElementById("rich-editor-ta") as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + open + selected + close + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + open.length, start + open.length + selected.length);
    }, 0);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <button
          type="button"
          onClick={() => insertTag("<b>", "</b>")}
          className="px-2 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-colors"
          title="加粗"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertTag("<i>", "</i>")}
          className="px-2 py-1 text-xs italic rounded hover:bg-gray-200 transition-colors"
          title="斜体"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertTag("<u>", "</u>")}
          className="px-2 py-1 text-xs underline rounded hover:bg-gray-200 transition-colors"
          title="下划线"
        >
          U
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertTag("<h2>", "</h2>")}
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors font-semibold"
          title="标题"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertTag("<p>", "</p>")}
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors"
          title="段落"
        >
          P
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertTag('<a href="">', "</a>")}
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors text-blue-600"
          title="链接"
        >
          链接
        </button>
        <button
          type="button"
          onClick={() =>
            insertTag(
              '<div style="background:#f0f4ff;padding:12px;border-radius:6px;border-left:4px solid #3b82f6;">',
              "</div>"
            )
          }
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors"
          title="引用块"
        >
          引用
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <span className="text-xs text-gray-400 ml-auto">支持 HTML</span>
      </div>

      {/* 编辑区 */}
      <textarea
        id="rich-editor-ta"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-sm font-mono resize-y focus:outline-none bg-white"
        style={{ minHeight }}
      />
    </div>
  );
}

// ─── 发送邮件 Tab ─────────────────────────────────────────────────────────────

function ComposeTab() {
  const [filterType, setFilterType] = useState<RecipientFilterType>("all");
  const [filterParams, setFilterParams] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [senderName, setSenderName] = useState("招新系统");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
  const [showPreview, setShowPreview] = useState(false);

  const { templates } = useEmailTemplates();
  const { mutate: sendEmail, isPending: sending, isSuccess, reset } = useSendEmail();

  const handleFilterParamChange = useCallback((key: string, value: string) => {
    setFilterParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    if (id === "none") return;
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    sendEmail({
      subject: subject.trim(),
      body: body.trim(),
      senderName: senderName.trim() || "招新系统",
      filterType,
      filterParams:
        filterType === "specific"
          ? { emails: filterParams.emails?.split(",").map((e) => e.trim()).filter(Boolean) }
          : filterType === "by_status"
          ? { status: filterParams.status }
          : filterType === "by_recruitment"
          ? { recruitmentId: filterParams.recruitmentId }
          : filterType === "by_club"
          ? { clubId: filterParams.clubId }
          : {},
      templateId: selectedTemplateId !== "none" ? selectedTemplateId : undefined,
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">邮件已提交发送</h3>
        <p className="text-sm text-gray-500">邮件正在后台异步发送，可在「发送记录」中查看进度</p>
        <Button onClick={reset} variant="outline" className="mt-2">
          继续发送
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 发件人 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">发件人名称</label>
          <Input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="例：招新系统"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">使用模板（可选）</label>
          <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="选择模板快速填充" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">不使用模板</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 收件人 */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">收件人</label>
        <RecipientSelector
          filterType={filterType}
          filterParams={filterParams}
          onFilterTypeChange={(v) => {
            setFilterType(v);
            setFilterParams({}); // 切换类型时清空旧参数
          }}
          onFilterParamChange={handleFilterParamChange}
        />
      </div>

      {/* 主题 */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">邮件主题</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="请输入邮件主题"
        />
      </div>

      {/* 正文 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">邮件正文</label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            {showPreview ? "关闭预览" : "HTML 预览"}
          </button>
        </div>
        {showPreview ? (
          <div
            className="border border-gray-200 rounded-lg p-4 min-h-[200px] prose prose-sm max-w-none bg-white"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <RichEditor
            value={body}
            onChange={setBody}
            placeholder="请输入邮件正文，支持 HTML 格式"
            minHeight="220px"
          />
        )}
      </div>

      {/* 发送按钮 */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              发送中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              发送邮件
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── 模板管理 Tab ─────────────────────────────────────────────────────────────

function TemplatesTab() {
  const { templates, isLoading, refetch } = useEmailTemplates();
  const { mutate: createTemplate, isPending: creating } = useCreateEmailTemplate();
  const { mutate: updateTemplate, isPending: updating } = useUpdateEmailTemplate();
  const { mutate: deleteTemplate } = useDeleteEmailTemplate();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "", description: "" });
  const [previewId, setPreviewId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm({ name: "", subject: "", body: "", description: "" });
    setShowForm(true);
  };

  const openEdit = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setForm({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
      description: tpl.description ?? "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return;
    if (editingTemplate) {
      updateTemplate(
        { id: editingTemplate.id, data: form },
        { onSuccess: () => setShowForm(false) }
      );
    } else {
      createTemplate(form, { onSuccess: () => setShowForm(false) });
    }
  };

  const previewTemplate = templates.find((t) => t.id === previewId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">共 {templates.length} 个模板</p>
        <Button onClick={openCreate} size="sm" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          新建模板
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>暂无模板，点击「新建模板」创建</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-start justify-between p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{tpl.name}</span>
                  {tpl.description && (
                    <span className="text-xs text-gray-400">{tpl.description}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">主题：{tpl.subject}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  创建于 {new Date(tpl.createdAt).toLocaleDateString("zh-CN")}
                  {tpl.creator?.name && ` · ${tpl.creator.name}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewId(tpl.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                  title="预览"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(tpl)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                  title="编辑"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate(tpl.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新建/编辑模板弹窗 */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "编辑模板" : "新建模板"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">模板名称 *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="例：录取通知"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">描述（可选）</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="简短描述模板用途"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">邮件主题 *</label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="请输入邮件主题"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">邮件正文 *</label>
              <RichEditor
                value={form.body}
                onChange={(v) => setForm((f) => ({ ...f, body: v }))}
                placeholder="请输入邮件正文，支持 HTML"
                minHeight="180px"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={creating || updating || !form.name.trim() || !form.subject.trim() || !form.body.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creating || updating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 模板预览弹窗 */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>模板预览：{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3 py-2">
              <div className="text-sm text-gray-500">
                主题：<span className="font-medium text-gray-800">{previewTemplate.subject}</span>
              </div>
              <div
                className="border border-gray-200 rounded-lg p-4 prose prose-sm max-w-none bg-gray-50"
                dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 发送记录 Tab ─────────────────────────────────────────────────────────────

function LogsTab() {
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const { logs, total, isLoading, refetch } = useEmailLogs(page, 15);
  const { log: detail, isLoading: detailLoading } = useEmailLogDetail(detailId);

  const totalPages = Math.ceil(total / 15);

  const filterTypeLabel: Record<string, string> = {
    all: "全部用户",
    specific: "指定邮箱",
    by_status: "按状态",
    by_recruitment: "按批次",
    by_club: "按社团",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">共 {total} 条记录</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          刷新
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>暂无发送记录</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-200 cursor-pointer transition-colors"
                onClick={() => setDetailId(log.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">{log.subject}</span>
                    <StatusBadge status={log.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>收件人：{log.recipientCount} 位</span>
                    <span className="text-green-600">成功 {log.successCount}</span>
                    {log.failCount > 0 && (
                      <span className="text-red-500">失败 {log.failCount}</span>
                    )}
                    <span>范围：{filterTypeLabel[log.filterType] ?? log.filterType}</span>
                    <span>{new Date(log.createdAt).toLocaleString("zh-CN")}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* 发送详情弹窗 */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              发送详情
              {detail && <StatusBadge status={detail.status} />}
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : detail ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">主题：</span>
                  <span className="font-medium">{detail.subject}</span>
                </div>
                <div>
                  <span className="text-gray-500">发件人：</span>
                  <span className="font-medium">{detail.senderName}</span>
                </div>
                <div>
                  <span className="text-gray-500">收件人数：</span>
                  <span className="font-medium">{detail.recipientCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">发送时间：</span>
                  <span className="font-medium">
                    {new Date(detail.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
              </div>

              {/* 收件人列表 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">收件人明细</p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {detail.recipients.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        {r.status === "sent" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : r.status === "failed" ? (
                          <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        ) : (
                          <Loader2 className="h-4 w-4 text-gray-300 flex-shrink-0 animate-spin" />
                        )}
                        <span className="text-gray-700">{r.email}</span>
                        {r.name && <span className="text-gray-400">({r.name})</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        {r.status === "sent" && r.sentAt
                          ? new Date(r.sentAt).toLocaleTimeString("zh-CN")
                          : r.error
                          ? <span className="text-red-400">{r.error}</span>
                          : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 邮件正文预览 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">邮件正文</p>
                <div
                  className="border border-gray-200 rounded-lg p-4 prose prose-sm max-w-none bg-gray-50 text-sm"
                  dangerouslySetInnerHTML={{ __html: detail.body }}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("compose");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">邮件系统</h1>
          <p className="text-sm text-gray-500">向候选人或用户批量发送邮件通知</p>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {activeTab === "compose" && <ComposeTab />}
          {activeTab === "templates" && <TemplatesTab />}
          {activeTab === "logs" && <LogsTab />}
        </CardContent>
      </Card>
    </div>
  );
}
