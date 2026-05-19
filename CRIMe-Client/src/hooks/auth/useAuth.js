import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import authService from '../../services/authService'
import useAuthStore from '../../store/authStore'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    clearError,
    logout: logoutStore
  } = useAuthStore()

// Initialize auth on app startup
const initializeAuth = async () => {
  try {
    setLoading(true)

    const res = await authService.getCurrentUser()

    setUser(res?.data?.user)
  } catch (error) {
    if (error?.response?.status === 401) {
      logoutStore()
    }
  } finally {
    setLoading(false)
  }
}

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,

    onSuccess: (data) => {
      setUser(data?.data?.user)
      clearError()
      
    },
    onError: (error) => {
      setError(error?.response?.data?.message || 'Login failed')
    }
  })

  // Register citizen mutation
  const registerMutation = useMutation({
    mutationFn: authService.registerCitizen,

    onSuccess: () => {
      clearError()
    },
    onError: (error) => {
      setError(error?.response?.data?.message || 'Registration failed')
    }
  })

  // Register with invite mutation
  const registerWithInviteMutation = useMutation({
    mutationFn: ({ token, userData }) =>
      authService.registerWithInvite(token, userData),

    onSuccess: () => {
      clearError()
    },
    onError: (error) => {
      setError(error?.response?.data?.message || 'Registration failed')
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      logoutStore()
      queryClient.clear()
    },
    onError: () => {
      // Force logout even if API call fails
      logoutStore()
      queryClient.clear()
    }
  })

  // Combined login function
  const login = async (credentials) => {
    clearError()
    return await loginMutation.mutateAsync(credentials)
  }

  // Combined register function
  const register = async (userData) => {
    clearError()
    return await registerMutation.mutateAsync(userData)
  }

  // Combined register with invite function
  const registerWithInvite = async (token, userData) => {
    clearError()
    return await registerWithInviteMutation.mutateAsync({ token, userData })
  }

  // Combined logout function
  const logout = async () => {
    return await logoutMutation.mutateAsync()
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading  || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,

    // Actions
    login,
    register,
    registerWithInvite,
    logout,
    initializeAuth,
    clearError,

    // Store methods
    setUser,
    setLoading
  }
}

export default useAuth
