import api from './api.js'

export const usersService = {
 
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

export default usersService
