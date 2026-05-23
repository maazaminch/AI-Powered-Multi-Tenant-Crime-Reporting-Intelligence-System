import api from './api.js'

export const notificationsService = {
  // Get user notifications
  getUserNotifications: async (page) => {
    const response = await api.get(`/api/notifications/fetch-notifications?page=${page}`)
    return response.data
  },

  getUserNotificationsForHeader: async () => {
    const response = await api.get('/api/notifications/fetch-header-notifications')
    return response.data
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/api/notifications/mark-as-read/${notificationId}`)
    return response.data
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/api/notifications/unread-count')
    return response.data
  }

  
}

export default notificationsService
