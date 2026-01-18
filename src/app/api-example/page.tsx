'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { authApi, usersApi } from '@/lib/api'

export default function ApiExamplePage() {
  // 健康检查查询
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => authApi.healthCheck(),
    enabled: true,
  })

  // 如果用户已认证，获取用户资料
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
    enabled: authApi.isAuthenticated(),
  })

  // 刷新令牌测试
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      if (typeof window === 'undefined') {
        throw new Error('无法在服务端环境下刷新令牌')
      }
      const token = localStorage.getItem('refresh_token')
      if (!token) {
        throw new Error('没有refreshToken')
      }
      return await authApi.refreshToken(token)
    },
    onSuccess: (data) => {
      alert('令牌刷新成功！')
      console.log('新令牌:', data)
    },
    onError: (error) => {
      alert('令牌刷新失败: ' + error.message)
      console.error('刷新失败:', error)
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API 示例页面</h1>
      
      <div className="space-y-6">
        {/* 健康检查 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">健康检查</h2>
          {healthQuery.isLoading && <p>检查中...</p>}
          {healthQuery.error && (
            <p className="text-red-600">错误: {(healthQuery.error as Error).message}</p>
          )}
          {healthQuery.data && (
            <div className="text-green-600">
              <p>状态: {healthQuery.data.status}</p>
              <p>时间戳: {healthQuery.data.timestamp}</p>
            </div>
          )}
        </div>

        {/* 认证状态 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">认证状态</h2>
          <p>已认证: {authApi.isAuthenticated() ? '是' : '否'}</p>
        </div>

        {/* 用户资料 */}
        {authApi.isAuthenticated() && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">用户资料</h2>
            {profileQuery.isLoading && <p>加载中...</p>}
            {profileQuery.error && (
              <p className="text-red-600">错误: {(profileQuery.error as Error).message}</p>
            )}
            {profileQuery.data && (
              <div className="space-y-2">
                <p><strong>姓名:</strong> {profileQuery.data.name}</p>
                <p><strong>邮箱:</strong> {profileQuery.data.email}</p>
                <p><strong>角色:</strong> {profileQuery.data.role}</p>
                {profileQuery.data.phone && (
                  <p><strong>电话:</strong> {profileQuery.data.phone}</p>
                )}
                {profileQuery.data.major && (
                  <p><strong>专业:</strong> {profileQuery.data.major}</p>
                )}
                {profileQuery.data.grade && (
                  <p><strong>年级:</strong> {profileQuery.data.grade}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* API 功能测试按钮 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">功能测试</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => authApi.clearAuth()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                清除认证
              </button>
              
              {authApi.isAuthenticated() && (
                <button
                  onClick={async () => {
                    try {
                      const profile = await usersApi.getProfile()
                      alert(`获取资料成功: ${profile.name}`)
                    } catch (error) {
                      alert(`获取资料失败: ${(error as Error).message}`)
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  获取用户资料
                </button>
              )}
              
              <button
                onClick={() => refreshTokenMutation.mutate()}
                disabled={refreshTokenMutation.isPending || !authApi.isAuthenticated()}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {refreshTokenMutation.isPending ? '刷新中...' : '刷新令牌'}
              </button>
            </div>
            
            {/* 令牌状态显示 */}
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">当前令牌状态:</h3>
              <div className="text-sm space-y-1">
                <p>认证状态: {authApi.isAuthenticated() ? '✅ 已登录' : '❌ 未登录'}</p>
            <p>AccessToken: {(typeof window !== 'undefined' && localStorage.getItem('access_token')) ? '✅ 存在' : '❌ 不存在'}</p>
            <p>RefreshToken: {(typeof window !== 'undefined' && localStorage.getItem('refresh_token')) ? '✅ 存在' : '❌ 不存在'}</p>
              </div>
            </div>
            
            {/* 刷新结果 */}
            {refreshTokenMutation.data && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700 font-medium">✅ 令牌刷新成功！</p>
                <p className="text-sm text-green-600 mt-1">
                  新的Access Token已保存到localStorage
                </p>
              </div>
            )}
            
            {refreshTokenMutation.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 font-medium">❌ 刷新失败</p>
                <p className="text-sm text-red-600 mt-1">
                  {(refreshTokenMutation.error as Error).message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}