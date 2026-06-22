import api from "./api";

export const adminService = {

      // Station Management
      createStation: async (station) => {
        const response = await api.post('/api/admin/create-station', station)
        return response.data
      },
      deleteStation: async (stationId) => {
        const response = await api.delete(`/api/admin/delete-station/${stationId}`)
        return response.data
      },
      activateOrDeactivateStation: async (stationId) => {
        const response = await api.patch(`/api/admin/activate-or-deactivate-station/${stationId}`)
        return response.data
      },
      getStations: async (page) => {
        const response = await api.get(`/api/admin/get-stations?page=${page}&limit=10`)
        return response.data
      },      
      getStationDetails: async (stationId) => {
        const response = await api.get(`/api/admin/get-station-details/${stationId}`)
        return response.data
      },
      assignOrChangeSho: async ({ stationId, policeId }) => {
        const response = await api.post(`/api/admin/assign-or-change-sho/${stationId}`, { policeId })
        return response.data
      },
      removeSho: async (stationId) => {
        const response = await api.post(`/api/admin/remove-sho/${stationId}`)
        return response.data
      },




      // Police Management
      getAllPolice: async (page, status, q, stationId) => {
        const params = new URLSearchParams({
          page: page || 1,
          limit: 10,
          status: status || ''
        })
        if (q) {
          params.append('q', q)
        }
        if (stationId) {
          params.append('stationId', stationId)
        }
        const response = await api.get(`/api/admin/get-all-police?${params}`)
        return response.data
      },
      getPoliceDetails: async (policeId) => {
        const response = await api.get(`/api/admin/get-police-details/${policeId}`)
        return response.data
      },
      assignPoliceToStation: async (policeId, stationId) => {
        const response = await api.post(`/api/admin/assign-police/${policeId}`, { stationId })
        return response.data
      },
      transferPolice: async (policeId, stationId) => {
        const response = await api.post(`/api/admin/transfer-police/${policeId}`, { stationId })
        return response.data
      },

      getPendingPolice: async (page) => {
        const response = await api.get(`/api/admin/pending-police?page=${page}&limit=10`)
        return response.data
      },


      dashboardStats: async () => {
      const response = await api.get('/api/admin/dashboard-stats')
      return response.data;
      },

      getTenantAnalytics: async () => {
        const response = await api.get('/api/admin/tenant-analytics')
        return response.data
      }

}    