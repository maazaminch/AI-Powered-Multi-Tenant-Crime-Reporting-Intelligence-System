import api from './api'

export const guestService = {
  sendOTP: async (email) => {
    const response = await api.post('/api/guest/send-otp', { email })
    return response.data
  },

  verifyOTP: async (sessionId, otp) => {
    const response = await api.post('/api/guest/verify-otp', { sessionId, otp })
    return response.data
  },

  reportCase: async (caseData) => {
    const response = await api.post('/api/guest/report-case', caseData)
    return response.data
  },

  trackCase: async (caseId, trackingToken) => {
  const response = await api.get(`/api/guest/track-case/${caseId}`, {
    params: { trackingToken }
  })
  return response.data
},

  caseDetails: async (caseId, trackingToken) => {
    const response = await api.get(`/api/guest/case-details/${caseId}`, {
      params: { trackingToken }
    })
    return response.data
  },

  caseUpdates: async (caseId, trackingToken) => {
    const response = await api.get(`/api/guest/case-updates/${caseId}`, {
      params: { trackingToken }
    })
    return response.data
  },

  addNote: async (caseId, trackingToken, note) => {
    const response = await api.post(`/api/guest/add-note/${caseId}`, { 
      trackingToken, note })
    return response.data
  },

  suggestNearestStations: async (lng, lat) => {
    const response = await api.get('/api/guest/suggest-nearest-stations', {
      params: { lng, lat }
    })
    return response.data
  }
}
