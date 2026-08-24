import api from './api.js'

export const usersService = {
 
  // Get users for dropdown
  getUsers: async () => {
    const response = await api.get('/api/users/get-users')
    return response
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/users/update-profile', profileData)
    return response
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/api/users/change-password', passwordData)
    return response
  },

  // Update user status (APPROVED, BLOCKED, REJECTED)
  updateUserStatus: async (userId, newStatus) => {
    const response = await api.post(`/api/users/update-user-status/${userId}`, { newStatus })
    return response
  },

  // Delete a user
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/users/delete-user/${userId}`)
    return response
  },

}
