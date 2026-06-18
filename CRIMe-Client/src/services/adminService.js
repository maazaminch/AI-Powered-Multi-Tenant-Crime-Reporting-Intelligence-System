import api from "./api";

export const adminService = {

      // Station Management
      createStation: async (stationData) => {
        const response = await api.post('/api/admin/create-station', stationData)
        return response.data
      },
      deleteStation: async (stationId) => {
        const response = await api.delete(`/api/admin/delete-station/${stationId}`)
        return response.data
      },
      activateOrDeactivateStation: async (stationId) => {
        const response = await api.put(`/api/admin/activate-or-deactivate-station/${stationId}`)
        return response.data
      },
      getStations: async (page) => {
        const response = await api.get(`/api/admin/get-stations?page=${page}&limit=10`)
        return response.data
      },      getStationDetails: async (stationId) => {
        const response = await api.get(`/api/admin/get-station-details/${stationId}`)
        return response.data
      },

      // Police Management
      getAllPolice: async (page, status, q, stationId) => {
        const params = new URLSearchParams()
        params.set('page', page)
        params.set('limit', 10)
        if (status) params.set('status', status)
        if (q) params.set('q', q)
        if (stationId) params.set('stationId', stationId)
        const response = await api.get(`/api/admin/get-all-police?${params.toString()}`)
        return response.data
      },
      getPoliceDetails: async (policeId) => {
        const response = await api.get(`/api/admin/police-details/${policeId}`)
        return response.data
      },
      assignPoliceToStation: async (policeId, stationId) => {
        const response = await api.post(`/api/admin/assign-police/${policeId}`, { stationId })
        return response.data
      },
      transferPolice: async (policeId, toStationId) => {
        const response = await api.post(`/api/admin/transfer-police/${policeId}`, { toStationId })
        return response.data
      },
      assignStationHead: async (stationId, policeId) => {
        const response = await api.post(`/api/admin/assign-station-head/${stationId}/${policeId}`)
        return response.data
      },
      removeStationHead: async (stationId, policeId) => {
        const response = await api.delete(`/api/admin/remove-station-head/${stationId}/${policeId}`)
        return response.data
      },

      getPendingPolice: async () => {
        const response = await api.get('/api/admin/pending-police')
        return response.data
      },


      dashboardStats: async () => {
      const response = await api.get('/api/admin/dashboard-stats')
      return response.data;
      }

}    