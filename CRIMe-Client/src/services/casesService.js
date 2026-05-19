import api from './api.js'

export const casesService = {
  // Create full case (authenticated citizen)
  createFullCase: async (caseData) => {
    const response = await api.post('/api/cases/create-full-case', caseData)
    return response
  },

  // Create anonymous case
  createAnonymousCase: async (caseData) => {
    const response = await api.post('/api/cases/create-anonymous-case', caseData)
    return response
  },

  // Search cases
  searchCases: async (params) => {
    const response = await api.post('/api/cases/search-case', params)
    return response
  },

  // Update case status
  updateCaseStatus: async (caseId, statusData) => {
    const response = await api.patch(`/api/cases/update-case-status/${caseId}`, statusData)
    return response
  },

  // Get assigned cases (for police)
  getAssignedCases: async () => {
    const response = await api.get('/api/cases/get-assigned-cases')
    return response
  }
}

export default casesService
