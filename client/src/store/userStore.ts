import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UserState {
  user: Record<string, any> | null
  token: string | null
  refreshToken: string | null
  isOtpGen: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: Record<string, any> | null) => void
  setToken: (token: string | null) => void
  setRefreshToken: (refreshToken: string | null) => void
  setTokens: (token: string | null, refreshToken: string | null) => void
  setOtpGen: (isOtpGen: boolean) => void
  clearError: () => void
  logout: () => void
}

const userStore = (set: any) => ({
  user: null,
  token: null,
  refreshToken: null,
  isOtpGen: false,
  isLoading: false,
  error: null,

  setUser: (user: Record<string, any> | null) => {
    set({ user })
  },

  setToken: (token: string | null) => {
    set({ token })
  },

  setRefreshToken: (refreshToken: string | null) => {
    set({ refreshToken })
  },

  setTokens: (token: string | null, refreshToken: string | null) => {
    set({ token, refreshToken })
  },

  setOtpGen: (isOtpGen: boolean) => {
    set({ isOtpGen })
  },

  clearError: () => {
    set({ error: null })
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      isOtpGen: false,
      error: null
    })
  }
})

const useUserStore = create(
  devtools(
    persist(userStore, {
      name: 'user-storage'
    })
  )
)

export default useUserStore
