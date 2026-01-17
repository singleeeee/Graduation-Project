import { create } from 'zustand'
import { authApi } from '@/lib/api'

interface AppState {
  user: {
    id: string | null
    name: string | null
    email: string | null
    role: string | null
  }
  isLoading: boolean
  setUser: (user: Partial<AppState['user']>) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  isAuthenticated: () => boolean
  hasRole: (role: string) => boolean
  isAdmin: () => boolean
  isCandidate: () => boolean
  isInterviewer: () => boolean
}

export const useAppStore = create<AppState>((set, get) => ({
  user: {
    id: null,
    name: null,
    email: null,
    role: null,
  },
  isLoading: false,
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: async () => {
    try {
      // 调用后端logout API
      await authApi.logout()
    } catch (error) {
      console.error('退出登录API调用失败:', error)
      // 即使API调用失败，也要清除本地状态
    }
    
    // 清除本地用户状态
    set({
      user: {
        id: null,
        name: null,
        email: null,
        role: null,
      }
    })
  },
  isAuthenticated: () => {
    const { user } = get()
    return !!(user.id && user.email)
  },
  hasRole: (role: string) => {
    const { user } = get()
    return user.role === role
  },
  isAdmin: () => {
    const { user } = get()
    return user.role === 'admin'
  },
  isCandidate: () => {
    const { user } = get()
    return user.role === 'candidate'
  },
  isInterviewer: () => {
    const { user } = get()
    return user.role === 'interviewer'
  },
}))