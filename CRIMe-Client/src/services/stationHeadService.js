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
  }
}

export default stationHeadService
