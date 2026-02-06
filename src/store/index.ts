import { create } from 'zustand'
import { authApi } from '@/lib/api'

interface AppState {
  user: {
    id: string | null
    name: string | null
    email: string | null
    role: string | {
      id: string
      name: string
      code: string
      level: number
      permissions: string[]
    } | null
    permissions: string[]
    roleCode?: string // 新增: 从角色对象中提取的简化角色代码
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
    permissions: []
  },
  isLoading: false,
    setUser: (user) => set((state) => { 
      // 从角色信息中提取roleCode
      let roleCode: string | undefined
      if (typeof user.role === 'string') {
        roleCode = user.role
      } else if (user.role && typeof user.role === 'object' && user.role.code) {
        roleCode = user.role.code
      } else if (state.user.role && typeof state.user.role === 'object' && state.user.role.code) {
        roleCode = state.user.role.code
      }
      
      return { 
        user: { 
          ...state.user, 
          ...user,
          // 设置roleCode
          roleCode,
          // Ensure permissions is always an array
          permissions: user.permissions || state.user.permissions || []
        } 
      }
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    // 清除本地用户状态
    set({
      user: {
        id: null,
        name: null,
        email: null,
        role: null,
        permissions: [],
        roleCode: undefined
      }
    })
  },
  isAuthenticated: () => {
    const { user } = get()
    return !!(user.id && user.email)
  },
  hasRole: (role: string) => {
    const { user } = get()
    return user.roleCode === role || user.role === role
  },
  isAdmin: () => {
    const { user } = get()
    return user.roleCode === 'super_admin' || user.role === 'super_admin'
  },
  isCandidate: () => {
    const { user } = get()
    return user.roleCode === 'candidate' || user.role === 'candidate'
  },
  isInterviewer: () => {
    const { user } = get()
    return user.roleCode === 'interviewer' || user.role === 'interviewer'
  },
}))