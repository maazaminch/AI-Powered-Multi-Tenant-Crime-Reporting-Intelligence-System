import api from './api.js'

export const stationsService = {
  // Get all stations
  getAllStations: async () => {
    const response = await api.get('/api/stations')
    return response
  },

  // Get station by ID
  getStationById: async (stationId) => {
    const response = await api.get(`/api/stations/${stationId}`)
    return response
  },

  // Create station
  createStation: async (stationData) => {
    const response = await api.post('/api/stations', stationData)
    return response
  },

  // Update station
  updateStation: async (stationId, stationData) => {
    const response = await api.put(`/api/stations/${stationId}`, stationData)
    return response
  },

  // Get station officers
  getStationOfficers: async (stationId) => {
    const response = await api.get(`/api/stations/${stationId}/officers`)
    return response
  }
}

export default stationsService
