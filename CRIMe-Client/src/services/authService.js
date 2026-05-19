import api from './api.js'

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    return response
  },

  // Register citizen
  registerCitizen: async (userData) => {
    const response = await api.post('/api/auth/register-citizen', userData)
    return response
  },

   // Create invite link
  createInviteLink: async (inviteData) => {
    const response = await api.post('/api/auth/create-invite-link', inviteData)
    return response
  },
  // Register with invite
  registerWithInvite: async (token, userData) => {
    const response = await api.post('/api/auth/register-with-invite-link', {
      token,
      ...userData
    })
    return response
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response
  },

  // Logout
  logout: async () => {
    const response = await api.post('/api/auth/logout')
    return response
  },

  // Update user details
  updateProfile: async (userData) => {
    const response = await api.put('/api/auth/update-user-details', userData)
    return response
  }
}

export default authService
