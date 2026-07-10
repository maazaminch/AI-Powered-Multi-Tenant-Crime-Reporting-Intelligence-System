import api from "./api"

export const policeService = {
    
    dashboardStats: async() => {
        const response = await api.get("/api/police/dashboard-stats")
        return response.data
    },

    getMyCases: async(params) => {
        const response = await api.get("/api/police/my-cases", { params })
        return response.data
    },

    getCaseDetails: async(caseId) => {
        const response = await api.get(`/api/police/case-details/${caseId}`)
        return response.data
    },

    getCaseUpdates: async(caseId) => {
        const response = await api.get(`/api/police/case-updates/${caseId}`)
        return response.data
    },

    addCaseUpdate: async(caseId, updateData) => {
        const response = await api.post(`/api/police/add-case-update/${caseId}`, updateData)
        return response.data
    },

    updateCaseStatus: async(caseId, statusData) => {
        const response = await api.patch(`/api/police/update-case-status/${caseId}`, statusData)
        return response.data
    }

}

export default policeService