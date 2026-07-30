import api from './api'
import { locationService } from './locationService'

export const citizenService = {

    dashboardStats: async () => {
        const response = await api.get('/api/citizen/dashboard-stats')
        return response.data
    },
    
    reportCase: async (caseData) => {
        const response = await api.post('/api/citizen/report-case-citizen', caseData)
        return response.data
    },
    
    suggestNearestStations: async (location) => {
        // Use new location service for nearby stations
        const { lat, lng } = location
        const response = await locationService.getNearbyStations(lat, lng, 20)
        return response
    },

    citizenCases: async (params) => {
        const response = await api.get('/api/citizen/citizen-cases', { params })
        return response.data
    },

    caseDetails: async (caseId) => {
        const response = await api.get(`/api/citizen/case-details/${caseId}`)
        return response.data
    },

    caseUpdates: async (caseId) => {
        const response = await api.get(`/api/citizen/case-updates/${caseId}`)
        return response.data
    },

    addNote: async (caseId) => {
        const response = await api.get(`/api/citizen/add-note/${caseId}`)
        return response.data
    },

    uploadEvidence: async (caseId) => {
        const response = await api.get(`/api/citizen/upload-evidence/${caseId}`)
        return response.data
    }

}
