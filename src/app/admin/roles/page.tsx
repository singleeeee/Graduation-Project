"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rolesApi, permissionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Shield } from "lucide-react";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  Role,
  RoleListParams,
  Permission,
  AssignPermissionsRequest,
  AddPermissionsRequest,
  RemovePermissionsRequest,
} from "@/lib/api";

export default function RolesManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const queryClient = useQueryClient();

  // 获取角色列表
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: [
      "roles",
      { page: currentPage, limit: pageSize, search: searchTerm },
    ],
    queryFn: async () => {
      try {
        const response: any = await rolesApi.getRoles({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
        });
        return (
          response?.data ||
          response?.data?.data ||
          response?.roles ||
          response?.data?.roles ||
          []
        );
      } catch (error) {
        toast.error("获取角色列表失败");
        throw error;
      }
    },
    staleTime: 0, // 禁用缓存，每次切换都重新获取数据
    refetchOnWindowFocus: true, // 窗口获得焦点时重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });

  // 获取权限列表
  const { data: permissionsData, error: permissionsError } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      try {
        console.log("Fetching permissions...");
        const response: any = await permissionsApi.getPermissions({
          limit: 100,
        });
        console.log("Permissions API response:", response);

        // 根据实际的 API 响应格式处理
        // API返回格式: response.data (包含id, name, code, module等字段)
        let permissions;
        if (response?.data?.permissions) {
          permissions = response.data.permissions;
        } else if (response?.data?.data?.permissions) {
          permissions = response.data.data.permissions;
        } else if (Array.isArray(response?.permissions)) {
          permissions = response.permissions;
        } else if (Array.isArray(response)) {
          permissions = response;
        } else if (Array.isArray(response?.data)) {
          permissions = response.data;
        } else {
          permissions = [];
        }

        console.log("Extracted permissions:", permissions);
        return permissions;
      } catch (error) {
        toast.error("获取权限列表失败");
        throw error;
      }
    },
    staleTime: 0, // 禁用缓存，每次切换都重新获取数据
    refetchOnWindowFocus: true, // 窗口获得焦点时重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });

  // 创建角色
  const createRoleMutation = useMutation({
    mutationFn: rolesApi.createRole,
    onSuccess: () => {
      toast.success("角色创建成功");
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "角色创建失败");
    },
  });

  // 更新角色
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      rolesApi.updateRole(id, data),
    onSuccess: () => {
      toast.success("角色更新成功");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "角色更新失败");
    },
  });

  // 删除角色
  const deleteRoleMutation = useMutation({
    mutationFn: rolesApi.deleteRole,
    onSuccess: () => {
      toast.success("角色删除成功");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "角色删除失败");
    },
  });

  // 切换角色状态
  const toggleRoleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      rolesApi.updateRole(id, { isActive }),
    onSuccess: () => {
      toast.success("角色状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => {
      toast.error("角色状态更新失败");
    },
  });

  const handleCreateRole = async (formData: CreateRoleRequest) => {
    try {
      // 提交表单数据，由mutation处理API调用和提示
      await createRoleMutation.mutateAsync(formData);
    } catch (error) {
      // 错误已经在mutation中处理
      console.error("Create role error:", error);
    }
  };

  const handleUpdateRole = (formData: UpdateRoleRequest) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, data: formData });
    }
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("确定要删除这个角色吗？")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleToggleStatus = (role: Role) => {
    toggleRoleStatusMutation.mutate({ id: role.id, isActive: !role.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">角色权限管理</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建角色
            </Button>
          </DialogTrigger>
          <CreateRoleDialog
            permissions={permissionsData || []}
            onSubmit={handleCreateRole}
            isLoading={createRoleMutation.isPending}
          />
        </Dialog>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索角色名称或代码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 角色列表 */}
      <Card>
        <CardHeader>
          <CardTitle>角色列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>角色代码</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>权限数量</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : rolesError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-destructive"
                  >
                    加载失败: 获取角色数据出错
                  </TableCell>
                </TableRow>
              ) : rolesData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                rolesData?.map((role: any) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.code}</TableCell>
                    <TableCell>{role.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? "default" : "secondary"}>
                        {role.isActive ? "启用" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell>{role.permissions?.length || 0}</TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsPermissionDialogOpen(true);
                            // 强制重置权限选择状态
                            setTimeout(() => {
                              queryClient.invalidateQueries({
                                queryKey: ["rolePermissions", role.id],
                              });
                            }, 100);
                          }}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center justify-center w-9 h-9 border rounded-md bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
                          <Switch
                            checked={role.isActive}
                            onCheckedChange={() => handleToggleStatus(role)}
                            className="h-4 w-4"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑角色对话框 */}
      {selectedRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditRoleDialog
            role={selectedRole}
            permissions={permissionsData || []}
            onSubmit={handleUpdateRole}
            isLoading={updateRoleMutation.isPending}
          />
        </Dialog>
      )}

      {/* 权限管理对话框 */}
      {selectedRole && (
        <Dialog
          open={isPermissionDialogOpen}
          onOpenChange={setIsPermissionDialogOpen}
          key={`permission-dialog-${selectedRole.id}`}
        >
          <PermissionManagementDialog
            role={selectedRole}
            permissions={permissionsData || []}
            onClose={() => setIsPermissionDialogOpen(false)}
          />
        </Dialog>
      )}
    </div>
  );
}

// 创建角色对话框组件
function CreateRoleDialog({
  permissions,
  onSubmit,
  isLoading,
}: {
  permissions: Permission[];
  onSubmit: (data: CreateRoleRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: "",
    code: "",
    description: "",
    permissionCodes: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>创建新角色</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">角色名称</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入角色名称"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">角色代码</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="请输入角色代码（如：admin, user）"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">角色描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="请输入角色描述"
          />
        </div>
        {/* 权限选择 */}
        <div className="space-y-2">
          <Label>选择权限</Label>
          <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
            {/* 按模块分组显示权限 */}
            {Object.entries(
              permissions.reduce(
                (acc, permission) => {
                  if (!acc[permission.module]) {
                    acc[permission.module] = [];
                  }
                  acc[permission.module].push(permission);
                  return acc;
                },
                {} as Record<string, any[]>,
              ),
            ).map(([module, modulePermissions]) => (
              <div key={module}>
                <div className="font-medium text-sm mb-1">{module}</div>
                <div className="grid grid-cols-1 gap-1">
                  {(modulePermissions as any[]).map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={
                          formData.permissionCodes?.includes(permission.code) ||
                          false
                        }
                        onChange={(e) => {
                          const currentCodes = formData.permissionCodes || [];
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissionCodes: [
                                ...currentCodes,
                                permission.code,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              permissionCodes: currentCodes.filter(
                                (code) => code !== permission.code,
                              ),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {permission.name}
                        {permission.description && (
                          <span className="text-gray-500 ml-1">
                            ({permission.description})
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "创建中..." : "创建角色"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// 编辑角色对话框组件
function EditRoleDialog({
  role,
  permissions,
  onSubmit,
  isLoading,
}: {
  role: Role;
  permissions: Permission[];
  onSubmit: (data: UpdateRoleRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: role.name,
    description: role.description || "",
    isActive: role.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>编辑角色: {role.name}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">角色名称</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入角色名称"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-description">角色描述</Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="请输入角色描述"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />
          <Label htmlFor="edit-isActive">启用角色</Label>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "更新中..." : "更新角色"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// 权限管理对话框组件
function PermissionManagementDialog({
  role,
  permissions,
  onClose,
}: {
  role: Role;
  permissions: Permission[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  // 获取角色当前权限 - 从角色详情中提取权限代码
  const roleWithPermissions = role as any;
  const rolePermissionsData = useMemo(
    () => roleWithPermissions?.permissions?.map((p: any) => p.code) || [],
    [roleWithPermissions],
  );

  // 分配权限给角色
  const assignPermissionsMutation = useMutation({
    mutationFn: (permissionCodes: string[]) =>
      rolesApi.assignPermissions(role.id, { permissionCodes }),
    onSuccess: () => {
      toast.success("权限分配成功");
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", role.id] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "权限分配失败");
    },
  });

  // 添加权限到角色
  const addPermissionsMutation = useMutation({
    mutationFn: (permissionCodes: string[]) =>
      rolesApi.addPermissions(role.id, { permissionCodes }),
    onSuccess: () => {
      toast.success("权限添加成功");
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", role.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "权限添加失败");
    },
  });

  // 从角色移除权限
  const removePermissionsMutation = useMutation({
    mutationFn: (permissionCodes: string[]) =>
      rolesApi.removePermissions(role.id, { permissionCodes }),
    onSuccess: () => {
      toast.success("权限移除成功");
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", role.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "权限移除失败");
    },
  });

  // 将权限codes转换为对应的权限IDs
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  );

  // 当权限列表加载完成时，初始化选中的权限
  useEffect(() => {
    if (permissions.length > 0 && rolePermissionsData.length >= 0) {
      console.log("Initializing selected permissions:", rolePermissionsData);
      setSelectedPermissions((prev) => {
        const newSet = new Set<string>(rolePermissionsData);
        // 只有当权限集合实际发生变化时才更新
        const prevCodes = Array.from(prev).sort().join(",");
        const newCodes = Array.from(newSet).sort().join(",");
        return prevCodes === newCodes ? prev : newSet;
      });
    }
  }, [rolePermissionsData, permissions.length]);

  // 按模块分组权限
  const permissionsByModule = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const handlePermissionToggle = (permissionCode: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionCode)) {
      newSelected.delete(permissionCode);
    } else {
      newSelected.add(permissionCode);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSavePermissions = () => {
    const currentPermissionCodes = Array.isArray(rolePermissionsData)
      ? rolePermissionsData
      : [];
    const newPermissionCodes = Array.from(selectedPermissions);

    // 找出需要新增的权限代码
    const permissionsToAdd = newPermissionCodes.filter(
      (code: string) => !currentPermissionCodes.includes(code),
    );
    // 找出需要移除的权限代码
    const permissionsToRemove = currentPermissionCodes.filter(
      (code: string) => !newPermissionCodes.includes(code),
    );

    // 批量处理权限变更
    const promises = [];

    if (permissionsToAdd.length > 0) {
      promises.push(addPermissionsMutation.mutateAsync(permissionsToAdd));
    }

    if (permissionsToRemove.length > 0) {
      promises.push(removePermissionsMutation.mutateAsync(permissionsToRemove));
    }

    Promise.all(promises)
      .then(() => {
        // 权限保存成功后刷新角色列表和当前角色权限
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        queryClient.invalidateQueries({
          queryKey: ["rolePermissions", role.id],
        });
        onClose();
      })
      .catch((error) => {
        console.error("Failed to save permissions:", error);
      });
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>管理角色权限: {role.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {Object.entries(permissionsByModule).map(
          ([module, modulePermissions]) => (
            <div key={module} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">{module}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(modulePermissions as any[]).map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Switch
                      checked={selectedPermissions.has(permission.code)}
                      onCheckedChange={() =>
                        handlePermissionToggle(permission.code)
                      }
                    />
                    <div>
                      <div className="font-medium">{permission.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {permission.code} - {permission.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button
          onClick={handleSavePermissions}
          disabled={
            addPermissionsMutation.isPending ||
            removePermissionsMutation.isPending
          }
        >
          {addPermissionsMutation.isPending ||
          removePermissionsMutation.isPending
            ? "保存中..."
            : "保存权限"}
        </Button>
      </div>
    </DialogContent>
  );
}
