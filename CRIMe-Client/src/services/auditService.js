import api from "./api";

export const auditService = {
  // Get audit logs with filters
  getAuditLogs: async (filters = {}) => {
    const response = await api.get('/api/audit/logs', { params: filters })
    return response.data
  },
  
  // Get specific audit log details
  getAuditLogById: async (id) => {
    const response = await api.get(`/api/audit/logs/${id}`)
    return response.data
  },
  
  // Get audit statistics
  getAuditStats: async () => {
    const response = await api.get('/api/audit/stats')
    return response.data
  },
  
  // Get user activity
  getUserActivity: async (userId, filters = {}) => {
    const response = await api.get(`/api/audit/user-activity/${userId}`, { params: filters })
    return response.data
  }
}