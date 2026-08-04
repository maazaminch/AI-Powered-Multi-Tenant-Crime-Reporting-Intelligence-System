import api from './api'

export const publicService = {
  sendOTP: async (email) => {
    const response = await api.post('/api/public/send-otp', { email })
    return response.data
  },

  verifyOTP: async (sessionId, otp) => {
    const response = await api.post('/api/public/verify-otp', { sessionId, otp })
    return response.data
  },

  reportCase: async (caseData) => {
    const response = await api.post('/api/public/report-case', caseData)
    return response.data
  },

  trackCase: async (caseId, trackingToken) => {
    const response = await api.get('/api/public/track-case', {
      params: { caseId, trackingToken }
    })
    return response.data
  },

  caseDetails: async (caseId, trackingToken) => {
    const response = await api.get('/api/public/case-details', {
      params: { caseId, trackingToken }
    })
    return response.data
  },

  caseUpdates: async (caseId, trackingToken) => {
    const response = await api.get('/api/public/case-updates', {
      params: { caseId, trackingToken }
    })
    return response.data
  },

  addNote: async (caseId, trackingToken, note) => {
    const response = await api.post('/api/public/add-note', { caseId, trackingToken, note })
    return response.data
  },

  uploadEvidence: async (caseId, trackingToken, evidenceFiles) => {
    const response = await api.post('/api/public/upload-evidence', { caseId, trackingToken, evidenceFiles })
    return response.data
  },

  suggestNearestStations: async (lng, lat) => {
    const response = await api.get('/api/public/suggest-nearest-stations', {
      params: { lng, lat }
    })
    return response.data
  }
}
