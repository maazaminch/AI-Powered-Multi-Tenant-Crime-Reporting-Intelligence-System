import api from './api.js'

export const tenantsService = {
  // Get all tenants
  getAllTenants: async () => {
    const response = await api.get('/api/tenants')
    return response
  },

  // Get tenant by ID
  getTenantById: async (tenantId) => {
    const response = await api.get(`/api/tenants/${tenantId}`)
    return response
  },

  // Create tenant
  createTenant: async (tenantData) => {
    const response = await api.post('/api/tenants', tenantData)
    return response
  },

  // Update tenant
  updateTenant: async (tenantId, tenantData) => {
    const response = await api.put(`/api/tenants/${tenantId}`, tenantData)
    return response
  }
}

export default tenantsService
