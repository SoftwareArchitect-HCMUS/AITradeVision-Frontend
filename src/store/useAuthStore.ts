import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  username: string
  isVip: boolean
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true })
      },
      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export const getAuthToken = () => useAuthStore.getState().token
