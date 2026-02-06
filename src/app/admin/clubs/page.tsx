"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Settings,
  ImageIcon,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { clubsApi, usersApi } from "@/lib/api";
import type {
  Club,
  ClubListParams,
  CreateClubRequest,
  UpdateClubRequest,
} from "@/lib/api";

interface ClubFilters {
  search: string;
  category: string;
  isActive: string;
}

function ClubManagementPageContent({
  user,
  logout,
}: {
  user: any;
  logout: () => void;
}) {
  const [filters, setFilters] = useState<ClubFilters>({
    search: "",
    category: "all",
    isActive: "active",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 查询参数
  const queryParams: ClubListParams = {
    page: currentPage,
    limit: pageSize,
    ...(filters.search && { search: filters.search }),
    ...(filters.category !== "all" && { category: filters.category }),
    ...(filters.isActive !== "all" && {
      isActive: filters.isActive === "active",
    }),
  };

  // 获取社团列表
  const {
    data: clubsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clubs", queryParams],
    queryFn: () => {
      return clubsApi.getClubs(queryParams);
    },
    enabled: true,
    staleTime: 0, // 禁用缓存，每次切换都重新获取数据
    refetchOnWindowFocus: true, // 窗口获得焦点时重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });

  // 创建社团
  const createClubMutation = useMutation({
    mutationFn: (data: CreateClubRequest) => clubsApi.createClub(data),
    onSuccess: () => {
      toast({ title: "成功", description: "社团创建成功" });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "创建社团失败",
        variant: "destructive",
      });
    },
  });

  // 更新社团
  const updateClubMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClubRequest }) =>
      clubsApi.updateClub(id, data),
    onSuccess: () => {
      toast({ title: "成功", description: "社团信息更新成功" });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setIsEditDialogOpen(false);
      setSelectedClub(null);
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "更新社团信息失败",
        variant: "destructive",
      });
    },
  });

  // 删除社团
  const deleteClubMutation = useMutation({
    mutationFn: (id: string) => clubsApi.deleteClub(id),
    onSuccess: () => {
      toast({ title: "成功", description: "社团删除成功" });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setIsDeleteDialogOpen(false);
      setSelectedClub(null);
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "删除社团失败",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1); // 重置页码
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, isActive: value }));
    setCurrentPage(1);
  };

  const handleEdit = (club: Club) => {
    setSelectedClub(club);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (club: Club) => {
    setSelectedClub(club);
    setIsDeleteDialogOpen(true);
  };

  const handleManageMembers = (club: Club) => {
    setSelectedClub(club);
    setIsMembersDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedClub) {
      deleteClubMutation.mutate(selectedClub.id);
    }
  };

  const clubs = clubsData?.data || [];
  const totalPages = clubsData?.totalPages || 0;

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">社团管理</h1>
          <p className="text-gray-500 mt-2">管理所有社团信息、成员和权限</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创建社团
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>创建社团</DialogTitle>
              <DialogDescription>
                创建一个新的社团，设置基本信息和分类
              </DialogDescription>
            </DialogHeader>
            <CreateClubForm
              onSubmit={(data) => createClubMutation.mutate(data)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">总社团数</p>
                <p className="text-2xl font-bold">{clubsData?.total || 0}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">活跃社团</p>
                <p className="text-2xl font-bold">
                  {clubs.filter((c) => c.isActive).length}
                </p>
              </div>
              <Badge variant="secondary">活跃</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">总成员数</p>
                <p className="text-2xl font-bold">
                  {clubs.reduce((sum, club) => sum + club.adminCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">总管理员</p>
                <p className="text-2xl font-bold">
                  {clubs.reduce((sum, club) => sum + club.adminCount, 0)}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索社团名称..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="社团分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                <SelectItem value="学术科技">学术科技</SelectItem>
                <SelectItem value="体育竞技">体育竞技</SelectItem>
                <SelectItem value="文学艺术">文学艺术</SelectItem>
                <SelectItem value="艺术文化">艺术文化</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.isActive} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">非活跃</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 社团列表 */}
      <Card>
        <CardHeader>
          <CardTitle>社团列表</CardTitle>
          <CardDescription>共 {clubsData?.total || 0} 个社团</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>社团信息</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>成员数</TableHead>
                <TableHead>管理员数</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : clubs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    暂无社团数据
                  </TableCell>
                </TableRow>
              ) : (
                clubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {club.logo ? (
                            <img
                              src={club.logo}
                              alt={club.name}
                              className="w-8 h-8 rounded"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{club.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {club.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(club.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={club.isActive ? "default" : "secondary"}>
                        {club.isActive ? "活跃" : "非活跃"}
                      </Badge>
                    </TableCell>
                    <TableCell>{club.candidateCount}</TableCell>
                    <TableCell>{club.adminCount}</TableCell>
                    <TableCell>
                      {new Date(club.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManageMembers(club)}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(club)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(club)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                显示 {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, clubsData?.total || 0)} 条，共{" "}
                {clubsData?.total} 条
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm">
                  第 {currentPage} / {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑社团对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑社团</DialogTitle>
            <DialogDescription>修改社团的基本信息</DialogDescription>
          </DialogHeader>
          {selectedClub && (
            <EditClubForm
              club={selectedClub}
              onSubmit={(data) =>
                updateClubMutation.mutate({ id: selectedClub.id, data })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除社团 &ldquo;{selectedClub?.name}&rdquo;
              吗？此操作将软删除社团信息。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteClubMutation.isPending}
            >
              {deleteClubMutation.isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 成员管理对话框 */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>成员管理 - {selectedClub?.name}</DialogTitle>
            <DialogDescription>管理社团成员和权限</DialogDescription>
          </DialogHeader>
          {selectedClub && <ClubMembersManagement clubId={selectedClub.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 创建社团表单组件
function CreateClubForm({
  onSubmit,
}: {
  onSubmit: (data: CreateClubRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateClubRequest>({
    name: "",
    description: "",
    category: "学术科技",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="create-club-name">社团名称</Label>
        <Input
          id="create-club-name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="请输入社团名称"
          required
        />
      </div>
      <div>
        <Label htmlFor="create-club-description">社团描述</Label>
        <Input
          id="create-club-description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="请输入社团描述"
          required
        />
      </div>
      <div>
        <Label htmlFor="create-club-category">社团分类</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="学术科技">学术科技</SelectItem>
            <SelectItem value="体育竞技">体育竞技</SelectItem>
            <SelectItem value="文学艺术">文学艺术</SelectItem>
            <SelectItem value="艺术文化">艺术文化</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            取消
          </Button>
        </DialogClose>
        <Button type="submit">创建</Button>
      </DialogFooter>
    </form>
  );
}

// 编辑社团表单组件
function EditClubForm({
  club,
  onSubmit,
}: {
  club: Club;
  onSubmit: (data: UpdateClubRequest) => void;
}) {
  const [formData, setFormData] = useState<UpdateClubRequest>({
    name: club.name,
    description: club.description,
    category: club.category,
    isActive: club.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-club-name">社团名称</Label>
        <Input
          id="edit-club-name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="请输入社团名称"
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-club-description">社团描述</Label>
        <Input
          id="edit-club-description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="请输入社团描述"
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-club-category">社团分类</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="学术科技">学术科技</SelectItem>
            <SelectItem value="体育竞技">体育竞技</SelectItem>
            <SelectItem value="文学艺术">文学艺术</SelectItem>
            <SelectItem value="艺术文化">艺术文化</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="edit-club-status">状态</Label>
        <Select
          value={formData.isActive ? "active" : "inactive"}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, isActive: value === "active" }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">活跃</SelectItem>
            <SelectItem value="inactive">非活跃</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            取消
          </Button>
        </DialogClose>
        <Button type="submit">保存</Button>
      </DialogFooter>
    </form>
  );
}

// 社团成员管理组件
function ClubMembersManagement({ clubId }: { clubId: string }) {
  const [membersParams, setMembersParams] = useState({
    role: "all",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 获取社团成员列表
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["club-members", clubId, membersParams, currentPage],
    queryFn: () =>
      clubsApi.getClubMembers(clubId, {
        page: currentPage,
        limit: pageSize,
        role:
          membersParams.role === "all"
            ? undefined
            : (membersParams.role as any),
        search: membersParams.search || undefined,
      }),
    enabled: true,
  });

  // 添加成员
  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string; role: "admin" | "candidate" }) =>
      clubsApi.addMember(clubId, data),
    onSuccess: () => {
      toast({ title: "成功", description: "成员添加成功" });
      queryClient.invalidateQueries({ queryKey: ["club-members"] });
      setIsAddMemberDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "添加成员失败",
        variant: "destructive",
      });
    },
  });

  // 更新成员角色
  const updateRoleMutation = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "admin" | "candidate";
    }) => clubsApi.updateMemberRole(clubId, memberId, { role }),
    onSuccess: () => {
      toast({ title: "成功", description: "成员角色更新成功" });
      queryClient.invalidateQueries({ queryKey: ["club-members"] });
      setIsEditRoleDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "更新成员角色失败",
        variant: "destructive",
      });
    },
  });

  // 移除成员
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => clubsApi.removeMember(clubId, memberId),
    onSuccess: () => {
      toast({ title: "成功", description: "成员移除成功" });
      queryClient.invalidateQueries({ queryKey: ["club-members"] });
      setIsRemoveDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast({
        title: "错误",
        description: error?.response?.data?.message || "移除成员失败",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (value: string) => {
    setMembersParams((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setMembersParams((prev) => ({ ...prev, role }));
    setCurrentPage(1);
  };

  const handleEditRole = (member: any) => {
    setSelectedMember(member);
    setIsEditRoleDialogOpen(true);
  };

  const handleRemove = (member: any) => {
    setSelectedMember(member);
    setIsRemoveDialogOpen(true);
  };

  const members = membersData?.data || [];
  const totalPages = membersData?.totalPages || 0;

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索成员..."
              value={membersParams.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={membersParams.role} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有角色</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
              <SelectItem value="candidate">候选人</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddMemberDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加成员
        </Button>
      </div>

      {/* 成员列表 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户信息</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>加入时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  加载中...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  暂无成员数据
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {member.user.avatar ? (
                          <img
                            src={member.user.avatar}
                            alt={member.user.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{member.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {member.role === "admin" ? "管理员" : "候选人"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              显示 {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, membersData?.total || 0)} 条，共{" "}
              {membersData?.total} 条
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="text-sm">
                第 {currentPage} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 添加成员对话框 */}
      <Dialog
        open={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加成员</DialogTitle>
            <DialogDescription>将用户添加为社团成员</DialogDescription>
          </DialogHeader>
          <AddMemberForm
            clubId={clubId}
            onSubmit={(data) => addMemberMutation.mutate(data)}
            onCancel={() => setIsAddMemberDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>修改角色</DialogTitle>
            <DialogDescription>
              修改 {selectedMember?.user.name} 的角色
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <EditRoleForm
              currentRole={selectedMember.role}
              onSubmit={(role) =>
                updateRoleMutation.mutate({ memberId: selectedMember.id, role })
              }
              onCancel={() => {
                setIsEditRoleDialogOpen(false);
                setSelectedMember(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 移除成员确认对话框 */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认移除</DialogTitle>
            <DialogDescription>
              确定要从社团中移除成员 {selectedMember?.user.name} 吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRemoveDialogOpen(false);
                setSelectedMember(null);
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedMember && removeMemberMutation.mutate(selectedMember.id)
              }
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? "移除中..." : "确认移除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 添加成员表单组件
function AddMemberForm({
  clubId,
  onSubmit,
  onCancel,
}: {
  clubId: string;
  onSubmit: (data: { userId: string; role: "admin" | "candidate" }) => void;
  onCancel: () => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "candidate">(
    "candidate",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 搜索用户
  const searchUsersMutation = useMutation({
    mutationFn: async (search: string) => {
      // 这里应该调用搜索用户的API，暂时使用模拟数据
      if (!search.trim()) return [];
      const response = await usersApi.getUsers({
        page: 1,
        limit: 10,
        search,
      });
      // 过滤掉已经是社团成员的用户
      const existingMembersResponse = await clubsApi.getClubMembers(clubId, {
        page: 1,
        limit: 100,
      });
      const existingMemberIds = existingMembersResponse.data.map(
        (m) => m.userId,
      );
      return response.users.filter(
        (user) => !existingMemberIds.includes(user.id),
      );
    },
    onSuccess: (users) => {
      setSearchResults(users);
      setIsSearching(false);
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: "搜索用户失败",
        variant: "destructive",
      });
      setIsSearching(false);
    },
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setIsSearching(true);
      searchUsersMutation.mutate(value);
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast({
        title: "错误",
        description: "请选择用户",
        variant: "destructive",
      });
      return;
    }
    onSubmit({ userId: selectedUserId, role: selectedRole });
  };

  const isSubmitting = searchUsersMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="search-users">搜索用户</Label>
        <Input
          id="search-users"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="输入姓名或邮箱搜索用户..."
          disabled={searchUsersMutation.isPending}
        />
        {isSearching && <p className="text-sm text-gray-500 mt-1">搜索中...</p>}
      </div>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div className="border rounded-lg max-h-40 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                selectedUserId === user.id ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={() => setSelectedUserId(user.id)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="userId"
                  value={user.id}
                  checked={selectedUserId === user.id}
                  onChange={() => setSelectedUserId(user.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="user-role">角色</Label>
        <Select
          value={selectedRole}
          onValueChange={(value: any) => setSelectedRole(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="candidate">候选人</SelectItem>
            <SelectItem value="admin">管理员</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={!selectedUserId || isSubmitting}>
          {isSubmitting ? "添加中..." : "添加到社团"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// 编辑角色表单组件
function EditRoleForm({
  currentRole,
  onSubmit,
  onCancel,
}: {
  currentRole: string;
  onSubmit: (role: "admin" | "candidate") => void;
  onCancel: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "candidate">(
    currentRole as any,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedRole);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="new-role">新角色</Label>
        <Select
          value={selectedRole}
          onValueChange={(value: any) => setSelectedRole(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="candidate">候选人</SelectItem>
            <SelectItem value="admin">管理员</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={selectedRole === currentRole}>
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}

// 工具函数
function getCategoryLabel(category: string): string {
  const categoryMap: { [key: string]: string } = {
    学术科技: "学术科技",
    体育竞技: "体育竞技",
    文学艺术: "文学艺术",
    艺术文化: "艺术文化",
    academic: "学术类",
    sports: "体育类",
    arts: "文艺类",
    technology: "科技类",
    volunteer: "志愿类",
    other: "其他",
  };
  return categoryMap[category] || category;
}

export default function ClubManagementPage() {
  return (
    <ProtectedRoute permission="user_view">
      <ClubManagementPageContent
        user={{
          id: "admin-1",
          name: "超级管理员",
          email: "admin@example.com",
          role: "system_admin",
        }}
        logout={async () => {
          try {
            const { logout: logoutStore } = useAppStore.getState();
            await logoutStore();
            window.location.href = "/login";
          } catch (error) {
            console.error("退出登录失败:", error);
            window.location.href = "/login";
          }
        }}
      />
    </ProtectedRoute>
  );
}
