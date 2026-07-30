import api from './api.js'

export const stationHeadService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/api/station-head/dashboard-stats')
    return response.data
  },

  // Get station police with stats
  getStationPolice: async (page = 1) => {
    const response = await api.get('/api/station-head/station-police', { params: { page } })
    return response.data
  },

  // Get police details
  getPoliceDetails: async (policeId) => {
    const response = await api.get(`/api/station-head/station-police-details/${policeId}`)
    return response.data
  },

  // Get station cases with filters
  getStationCases: async (params = {}) => {
    const response = await api.get('/api/station-head/station-cases', { params })
    return response.data
  },

  // Get case details
  getCaseDetails: async (caseId) => {
    const response = await api.get(`/api/station-head/case-details/${caseId}`)
    return response.data
  },

  // Close case status
  closeCaseStatus: async (caseId, remarks) => {
    const response = await api.patch(`/api/station-head/close-case-status/${caseId}`, { remarks })
    return response.data
  },

  // Add case update
  addCaseUpdate: async (caseId, updateData) => {
    const response = await api.post(`/api/station-head/add-case-update/${caseId}`, updateData)
    return response.data
  },

  // Get case updates
  getCaseUpdates: async (caseId) => {
    const response = await api.get(`/api/station-head/get-case-updates/${caseId}`)
    return response.data
  },

  // Assign case to police
  assignCaseToPolice: async (caseId, policeId) => {
    const response = await api.post(`/api/station-head/assign-case-to-police/${caseId}`, { policeId })
    return response.data
  },

  // Reassign case
  reassignCase: async (caseId, policeId) => {
    const response = await api.post(`/api/station-head/reassign-case/${caseId}`, { PoliceId: policeId })
    return response.data
  },

  stationAnalytics: async (params = {}) => {
    const response = await api.get('/api/station-head/station-analytics', { params })
    return response.data
  }
  
}

