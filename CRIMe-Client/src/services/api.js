import axios from 'axios'
import useAuthStore from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const isLoginRequest = ['/api/auth/login', '/api/auth/google-login']
      .some((path) => error.config?.url?.includes(path))

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      useAuthStore.getState().isAuthenticated
    ) {
      useAuthStore.getState().logout()
      sessionStorage.setItem('session-expired', 'true')
      window.location.assign('/login')
    }
    
    // Extract error message from backend response
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    error.backendMessage = errorMessage
    
    return Promise.reject(error)
  }
)

export default api
