import { authApi, axiosService } from '../index'

// 模拟 console.log 和 console.error
const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {})
const mockError = jest.spyOn(console, 'error').mockImplementation(() => {})

// 模拟 localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('令牌刷新功能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockReturnValue(undefined)
    mockLocalStorage.removeItem.mockReturnValue(undefined)
    
    // 重置axiosService的状态
    ;(axiosService as any).isRefreshing = false
    ;(axiosService as any).failedQueue = []
  })

  describe('手动刷新令牌', () => {
    it('应该成功刷新令牌', async () => {
      const mockRefreshResponse = {
        code: 200,
        message: '令牌刷新成功',
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 900
        },
        success: true
      }

      // 模拟axios请求
      const mockPost = jest.spyOn(axiosService, 'post').mockResolvedValue(mockRefreshResponse)

      // 模拟本地存储的refresh token
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'refreshToken') return 'old-refresh-token'
        if (key === 'accessToken') return 'old-access-token'
        return null
      })

      // 执行刷新
      const result = await authApi.refreshToken('old-refresh-token')

      // 验证结果
      expect(result.accessToken).toBe('new-access-token')
      expect(result.refreshToken).toBe('new-refresh-token')
      expect(result.expiresIn).toBe(900)

      // 验证本地存储已更新
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token')

      mockPost.mockRestore()
    })

    it('应该处理刷新令牌失败的情况', async () => {
      const mockError = new Error('刷新令牌已过期')
      const mockPost = jest.spyOn(axiosService, 'post').mockRejectedValue(mockError)

      // 模拟本地存储
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'refreshToken') return 'expired-refresh-token'
        if (key === 'accessToken') return 'old-access-token'
        return null
      })

      // 执行刷新应该抛出错误
      await expect(authApi.refreshToken('expired-refresh-token'))
        .rejects.toThrow('刷新令牌已过期')

      mockPost.mockRestore()
    })
  })

  describe('令牌存在性检查', () => {
    it('应该正确判断令牌是否存在', () => {
      // 有令牌的情况
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'accessToken') return 'some-token'
        return null
      })
      expect(authApi.isAuthenticated()).toBe(true)

      // 无令牌的情况
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'accessToken') return null
        return null
      })
      expect(authApi.isAuthenticated()).toBe(false)
    })

    it('应该检查令牌存储', () => {
      // 有令牌的情况
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'accessToken') return 'mock-access-token'
        if (key === 'refreshToken') return 'mock-refresh-token'
        return null
      })

      expect(authApi.isAuthenticated()).toBe(true)

      // 验证localStorage被正确访问
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('accessToken')
    })

    it('应该清除所有令牌', () => {
      // 模拟清除操作
      mockLocalStorage.removeItem.mockReturnValue(undefined)

      authApi.clearAuth()

      // 验证localStorage被正确清理
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    })
  })

  describe('自动令牌管理', () => {
    it('应该正确设置令牌', async () => {
      // 清除之前的调用记录
      mockLocalStorage.setItem.mockClear()

      // 先登录获取令牌
      const mockLoginResponse = {
        code: 200,
        message: '登录成功',
        data: {
          accessToken: 'login-access-token',
          refreshToken: 'login-refresh-token',
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            role: 'candidate'
          }
        },
        success: true
      }

      const mockPost = jest.spyOn(axiosService, 'post').mockResolvedValue(mockLoginResponse)

      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password'
      })

      // 验证令牌被正确保存
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', 'login-access-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'login-refresh-token')

      // 验证认证状态
      expect(authApi.isAuthenticated()).toBe(true)

      mockPost.mockRestore()
    })
  })
})