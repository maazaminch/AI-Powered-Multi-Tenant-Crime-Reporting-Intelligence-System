import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

const useAuthStore = create(
  devtools(
    persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null
        })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error, isLoading: false })
      },

      clearError: () => {
        set({ error: null })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false
        })
      },

      // Getters
      getUserRole: () => {
        const { user } = get()
        return user?.role || null
      },

      isCitizen: () => {
        const { user } = get()
        return user?.role === 'CITIZEN'
      },

      isPolice: () => {
        const { user } = get()
        return user?.role === 'POLICE'
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === 'ADMIN'
      },

      isSuperAdmin: () => {
        const { user } = get()
        return user?.isSuperAdmin || false
      },

      isStationHead: () => {
        const { user } = get()
        return user?.isStationHead || false
      },

      getTenantId: () => {
        const { user } = get()
        return user?.tenantId || null
      },

      getPoliceStationId: () => {
        const { user } = get()
        return user?.policeStationId || null
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
)

export default useAuthStore
