import { authApi, usersApi } from '../index'

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

describe('认证 API 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockReturnValue(undefined)
    mockLocalStorage.removeItem.mockReturnValue(undefined)
  })

  describe('健康检查', () => {
    it('应该成功获取健康状态', async () => {
      const mockResponse = {
        code: 200,
        message: 'Server is healthy',
        data: { status: 'ok', timestamp: '2024-01-01T00:00:00Z' },
        success: true
      }

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      )

      const result = await authApi.healthCheck()
      expect(result.status).toBe('ok')
    })
  })

  describe('认证状态检查', () => {
    it('未认证时应返回 false', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      expect(authApi.isAuthenticated()).toBe(false)
    })

    it('有令牌时应返回 true', () => {
      mockLocalStorage.getItem.mockReturnValue('mock-token')
      expect(authApi.isAuthenticated()).toBe(true)
    })
  })

  describe('令牌管理', () => {
    it('应该正确设置和清除令牌', () => {
      authApi.setTokens('access-token', 'refresh-token')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'access-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token')
      
      authApi.clearAuth()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
    })
  })
})