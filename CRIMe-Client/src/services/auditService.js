import api from "./api";

export const auditService = {
  // Get audit logs with filters
  getAuditLogs: async (filters = {}) => {
    const response = await api.get('/api/audit/logs', { params: filters })
    return response.data
  },
  
  
  // Get audit statistics
  getAuditStats: async () => {
    const response = await api.get('/api/audit/stats')
    return response.data
  }

}