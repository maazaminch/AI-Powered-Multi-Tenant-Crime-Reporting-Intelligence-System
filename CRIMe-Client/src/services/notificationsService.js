import api from './api.js'

export const notificationsService = {
  // Get user notifications
  getUserNotifications: async () => {
    const response = await api.get('/api/notifications')
    return response
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/api/notifications/${notificationId}/read`)
    return response
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/api/notifications/read-all')
    return response
  }
}

export default notificationsService
