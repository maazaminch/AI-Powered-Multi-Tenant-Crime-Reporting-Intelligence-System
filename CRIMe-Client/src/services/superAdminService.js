import api from './api.js'

export const superAdminService = {
  // Tenant Management
  createTenant: async (tenantData) => {
    return api.post('/api/superadmin/create-tenant', tenantData)
  },

  deleteTenant: async (tenantId) => {
    return api.delete(`/api/superadmin/delete-tenant/${tenantId}`)
  },

  activateOrDeactivateTenant: async (tenantId) => {
    return api.put(`/api/superadmin/activate-or-deactivate-tenant/${tenantId}`)
  },

  getTenants: async (page) => {
    const response = await api.get(
      `/api/superadmin/get-tenants?page=${page}&limit=10`
    )

    return response.data
  },

  getTenantDetails: async (tenantId) => {
    const response = await api.get(`/api/superadmin/tenant-details/${tenantId}`)
    return response.data
  },

  // Admin Management
  getAllAdmins: async ({ page, status }) => {
    const response = await api.get(`/api/superadmin/get-admins?page=${page}&limit=10&status=${status}`)
    return response.data
  },

  getAdminDetails: async (adminId) => {
    const response = await api.get(`/api/superadmin/get-admin-details/${adminId}`)
    return response.data
  },

  getPendingAdmins: async () => {
    const response = await api.get('/api/superadmin/pending-admins')
    return response.data
  },

  assignAdminToTenant: async (adminId, tenantId) => {
    const response = await api.post(`/api/superadmin/assign-admin/${adminId}`, { tenantId })
    return response.data
  },

  transferAdmin: async (adminId, newTenantId) => {
    const response = await api.post(`/api/superadmin/transfer-admin/${adminId}`, { newTenantId })
    return response.data
  },

  // Analytics and Stats
  dashboardStats: async () => {
    const response = await api.get('/api/superadmin/dashboard-stats')
    return response.data
  },

  getSystemAnalytics: async () => {
    const response = await api.get('/api/superadmin/system-analytics')
    return response.data
  },

//   getAdminPerformance: async () => {
//     const response = await api.get('/api/superadmin/admin-performance')
//     return response.data
//   },



//   getTenantAnalytics: async () => {
//     const response = await api.get('/api/superadmin/tenant-analytics')
//     return response
//   }
}

export default superAdminService
