import api from './api'


export const evidenceService = {
  
    uploadStandalone: async (formData) => {
        const response = await api.post('/api/evidence/upload-standalone', formData)
        return response.data
    },
    uploadToCase: async (caseId, formData) => {
        const response = await api.post(`/api/evidence/upload-evidence/${caseId}`, formData)
        return response.data
    },
    getCaseEvidence: async (caseId) => {
        const response = await api.get(`/api/evidence/case/${caseId}`)
        return response.data
    },
    getEvidence: async (evidenceId) => {
        const response = await api.get(`/api/evidence/${evidenceId}`)
        return response.data
    },
    deleteEvidence: async (evidenceId) => {
        const response = await api.delete(`/api/evidence/${evidenceId}`)
        return response.data
    },
    deleteStandaloneEvidence: async (evidenceId) => {
        const response = await api.delete(`/api/evidence/standalone/${evidenceId}`)
        return response.data
    },
    deleteGuestStandaloneEvidence: async (evidenceId, guestSessionId) => {
        const response = await api.delete(`/api/evidence/guest/standalone/${evidenceId}`, {
            data: { guestSessionId }
        })
        return response.data
    },
    // Guest evidence endpoints
    uploadGuestStandalone: async (formData) => {
        const response = await api.post('/api/evidence/guest/upload-standalone', formData)
        return response.data
    },
    uploadGuestToCase: async (trackingToken, formData) => {
        const response = await api.post(`/api/evidence/guest/upload-evidence/${trackingToken}`, formData)
        return response.data
    }
}