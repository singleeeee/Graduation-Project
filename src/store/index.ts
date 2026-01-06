import { create } from 'zustand'

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
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: null,
    name: null,
    email: null,
    role: null,
  },
  isLoading: false,
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({
    user: {
      id: null,
      name: null,
      email: null,
      role: null,
    }
  }),
}))