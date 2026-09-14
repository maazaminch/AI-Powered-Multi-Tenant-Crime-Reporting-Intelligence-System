import api from './api'


export const evidenceService = {
  
    uploadStandalone: async (formData) => {
        const response = await api.post('/api/evidence/upload-standalone', formData)
        return response
    },
    uploadToCase: async (caseId, formData) => {
        const response = await api.post(`/api/evidence/upload-evidence/${caseId}`, formData)
        return response
    },
    getCaseEvidence: async (caseId) => {
        const response = await api.get(`/api/evidence/case/${caseId}`)
        return response
    },
    getEvidence: async (evidenceId) => {
        const response = await api.get(`/api/evidence/${evidenceId}`)
        return response
    },
    deleteEvidence: async (evidenceId) => {
        const response = await api.delete(`/api/evidence/${evidenceId}`)
        return response
    },
    // Guest evidence endpoints
    uploadGuestStandalone: async (formData) => {
        const response = await api.post('/api/evidence/guest/upload-standalone', formData)
        return response
    },
    uploadGuestToCase: async (trackingToken, formData) => {
        const response = await api.post(`/api/evidence/guest/upload-evidence/${trackingToken}`, formData)
        return response
    }
}