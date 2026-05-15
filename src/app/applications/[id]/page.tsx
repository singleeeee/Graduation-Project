"use client";

import { useApplicationDetail } from "@/hooks/use-applications";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import { filesApi } from "@/lib/api/files";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const { hasPermission } = usePermissions();

  // 只有拥有 application_update 权限的管理员才能看到 AI 评估结果
  const canViewAiResult = hasPermission("application_update");

  // 使用Hook获取申请详情
  const {
    data: application,
    isLoading,
    isError,
    error,
  } = useApplicationDetail(applicationId);

  // 调试日志
  console.log("Application detail data:", application);
  console.log("Application detail loading:", isLoading);
  console.log("Application detail error:", error);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          label: "已提交",
          icon: Clock,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "screening":
        return {
          label: "筛选中",
          icon: AlertCircle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "rejected":
        return {
          label: "未通过",
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      case "interview_scheduled":
        return {
          label: "已安排面试",
          icon: Clock,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
      case "interview_completed":
        return {
          label: "面试完成",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "offer_sent":
        return {
          label: "已发Offer",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "accepted":
        return {
          label: "已接受",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "declined":
        return {
          label: "已拒绝",
          icon: XCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
      default:
        return {
          label: "未知",
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载申请详情...</span>
        </div>
      </div>
    );
  }

  // 错误状态
  if (isError || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>加载失败</CardTitle>
            <CardDescription>
              无法获取申请详情，请刷新页面重试
              {error && <p className="text-red-500 mt-2">{error.message}</p>}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.back()}>返回</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">申请详情</h1>
          <p className="text-gray-600">查看申请的详细信息和状态</p>
        </div>
      </div>

      {/* 基本信息卡片 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                {application.recruitment?.title || "未知招新"}
              </CardTitle>
              <CardDescription className="mt-2">
                {application.recruitment?.club?.name || "未知社团"}
              </CardDescription>
            </div>
            <div
              className={`flex items-center gap-2 ${statusInfo.color} ${statusInfo.bgColor} px-3 py-2 rounded-lg`}
            >
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">{statusInfo.label}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 申请信息 */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">申请信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">申请时间:</span>
                  <span>
                    {new Date(application.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后更新:</span>
                  <span>
                    {new Date(application.updatedAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                {application.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">提交时间:</span>
                    <span>
                      {new Date(application.submittedAt).toLocaleString(
                        "zh-CN",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 申请人信息 */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">申请人信息</h3>
              <div className="space-y-3 text-sm">
                {application.applicant && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">姓名:</span>
                    <span>{application.applicant.name || "-"}</span>
                  </div>
                )}
                {/* 从 applicant 档案字段读取，后端已展开 profileFields */}
                {application.applicant?.studentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">学号:</span>
                    <span>{application.applicant.studentId}</span>
                  </div>
                )}
                {application.applicant?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">电话:</span>
                    <span>{application.applicant.phone}</span>
                  </div>
                )}
                {application.applicant?.college && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">学院:</span>
                    <span>{application.applicant.college}</span>
                  </div>
                )}
                {application.applicant?.major && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">专业:</span>
                    <span>{application.applicant.major}</span>
                  </div>
                )}
                {application.applicant?.grade && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">年级:</span>
                    <span>{application.applicant.grade}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 申请内容：综合 education(申请时填的表单) + 档案中的 experience/motivation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">申请内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(() => {
            // 合并 education 和 applicant 中的 experience/motivation
            const edu = (application.education || {}) as Record<string, any>;
            const merged: Record<string, any> = { ...edu };
            // 档案中的 experience/motivation 作为补充
            if (application.applicant?.experience && !merged.experience) {
              merged.experience = application.applicant.experience;
            }
            if (application.applicant?.motivation && !merged.motivation) {
              merged.motivation = application.applicant.motivation;
            }

            const labelMap: Record<string, string> = {
              name: '姓名',
              phone: '电话',
              studentId: '学号',
              college: '学院',
              major: '专业',
              grade: '年级',
              school: '学校',
              experience: '相关经验',
              motivation: '申请动机',
            };

            const entries = Object.entries(merged).filter(([, v]) => v && v !== '');

            if (entries.length === 0) {
              return <p className="text-gray-400">暂无申请内容</p>;
            }

            return entries.map(([key, value]) => (
              <div key={key}>
                <h4 className="font-semibold text-gray-900 mb-2">{labelMap[key] || key}</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{String(value)}</p>
              </div>
            ));
          })()}
        </CardContent>
      </Card>

      {/* 经历和项目经验 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">项目经历</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {application.experiences && application.experiences.length > 0 ? (
              application.experiences.map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <span className="text-sm text-gray-500">
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString("zh-CN") : "未填写"} -{" "}
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString("zh-CN") : "至今"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">类型:</span>{" "}
                    {exp.type === "project"
                      ? "项目经历"
                      : exp.type === "internship"
                        ? "实习经历"
                        : "其他"}
                  </div>

                  {exp.skills && exp.skills.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        技能标签:{" "}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exp.skills.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {exp.description && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        描述:{" "}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">
                        {exp.description}
                      </p>
                    </div>
                  )}

                  {exp.achievements && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        成果:{" "}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">
                        {exp.achievements}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">未填写</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 附件 */}
      {(application as any).files && (application as any).files.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">附件文件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(application as any).files.map((file: any, index: number) => {
                const FILE_TYPE_LABELS: Record<string, string> = {
                  resume: "简历",
                  portfolio: "作品集",
                  certificate: "证书",
                  avatar: "头像",
                  other: "其他",
                };
                const canPreview = file.previewable ?? filesApi.isPreviewable(file.mimeType ?? "");
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {file.originalName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          {file.description && <span>{file.description}</span>}
                          {file.description && <span>·</span>}
                          <span>{FILE_TYPE_LABELS[file.fileType] ?? file.fileType}</span>
                          {file.size && (
                            <>
                              <span>·</span>
                              <span>{filesApi.formatSize(file.size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {canPreview && file.viewUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.viewUrl, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          预览
                        </Button>
                      )}
                      {file.downloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            filesApi.download(file.fileId, file.originalName).catch((e) => {
                              console.error("下载失败:", e);
                            })
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
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

      {/* AI分析结果：仅管理员可见 */}
      {canViewAiResult && application.status !== "draft" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ✨ AI 评估结果
              {application.aiScore == null && (
                <span className="text-sm font-normal text-gray-400 animate-pulse">评估中...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 评估中骨架屏 */}
            {application.aiScore == null ? (
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 bg-gray-200 rounded" />
                  <div className="h-5 w-10 bg-gray-100 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 w-16 bg-gray-200 rounded" />
                        <div className="h-3 w-6 bg-gray-200 rounded" />
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2 bg-blue-50 rounded-lg px-4 py-3">
                  <div className="h-3 w-full bg-blue-100 rounded" />
                  <div className="h-3 w-3/4 bg-blue-100 rounded" />
                </div>
                <p className="text-center text-xs text-gray-400 pt-1">
                  AI 正在分析您的申请材料，通常需要 10~30 秒，请稍候...
                </p>
              </div>
            ) : (
            /* 评分行 */
            (() => {
              const score = Number(application.aiScore);
              const analysis = application.aiAnalysis as any;
              return (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-bold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-orange-500" : "text-red-500"}`}>
                      {score.toFixed(0)}
                    </span>
                    <span className="text-gray-400 self-end mb-1">/ 100</span>
                    <Badge className={`ml-1 ${score >= 80 ? "bg-green-100 text-green-700" : score >= 60 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                      {score >= 80 ? "优秀" : score >= 60 ? "合格" : "待提升"}
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

                  {/* 维度分进度条 */}
                  {analysis?.details && (
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { key: "motivation", label: "动机热情" },
                        { key: "experience", label: "相关经验" },
                        { key: "skills",     label: "技能匹配" },
                        { key: "expression", label: "表达能力" },
                      ] as const).map(({ key, label }) => {
                        const val = analysis.details[key] as number;
                        return (
                          <div key={key} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-sm text-gray-600">{label}</span>
                              <span className={`text-sm font-semibold ${val >= 80 ? "text-green-600" : val >= 60 ? "text-orange-500" : "text-red-500"}`}>{val}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${val >= 80 ? "bg-green-500" : val >= 60 ? "bg-orange-400" : "bg-red-400"}`}
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
                    <p className="text-gray-700 bg-blue-50 rounded-lg px-4 py-3 border-l-2 border-blue-300 text-sm">
                      {analysis.summary}
                    </p>
                  )}

                  {/* 优势 */}
                  {Array.isArray(analysis?.strengths) && analysis.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">优势亮点</h4>
                      <ul className="space-y-1.5">
                        {analysis.strengths.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-green-500 mt-0.5">✓</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 不足 */}
                  {Array.isArray(analysis?.weaknesses) && analysis.weaknesses.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">待提升方向</h4>
                      <ul className="space-y-1.5">
                        {analysis.weaknesses.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-orange-400 mt-0.5">→</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()
            )}
          </CardContent>
        </Card>
      )}

      {/* 面试信息 */}
      {application.interviews && application.interviews.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">面试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.interviews.map((interview, index) => (
                <div
                  key={interview.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">面试 #{index + 1}</h4>
                      <p className="text-sm text-gray-600">
                        面试时间:{" "}
                        {new Date(interview.scheduledTime).toLocaleString(
                          "zh-CN",
                        )}
                      </p>
                      {interview.interviewer && (
                        <p className="text-sm text-gray-600">
                          面试官: {interview.interviewer.name}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        interview.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {interview.status === "completed" ? "已完成" : "待进行"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 状态历史 */}
      {application.statusHistory && application.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">状态历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.statusHistory.map((history) => {
                const historyStatusInfo = getStatusInfo(history.status);
                const HistoryIcon = historyStatusInfo.icon;

                return (
                  <div
                    key={history.id}
                    className="flex items-start gap-4 border-l-2 border-gray-200 pl-4 pb-4"
                  >
                    <div className={`${historyStatusInfo.color} mt-1`}>
                      <HistoryIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {historyStatusInfo.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.changedAt).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        操作人: {history.changedBy.name} (
                        {history.changedBy.role})
                      </div>
                      {history.comment && (
                        <div className="text-sm text-gray-700 mt-1">
                          备注: {history.comment}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
