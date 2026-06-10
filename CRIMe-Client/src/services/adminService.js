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
      getAllPolice: async (page, status) => {
        const response = await api.get(`/api/admin/all-police?page=${page}&limit=10&status=${status}`)
        return response.data
      },
      getPoliceDetails: async (policeId) => {
        const response = await api.get(`/api/admin/get-police-details/${policeId}`)
        return response.data
      },
      assignPoliceToStation: async (policeId, stationId) => {
        const response = await api.post(`/api/admin/assign-police-to-station/${policeId}`, { stationId })
        return response.data
      },
      transferPolice: async (policeId, newStationId) => {
        const response = await api.post(`/api/admin/transfer-police/${policeId}`, { newStationId })
        return response.data
      },
      assignSHO: async (policeId) => {
        const response = await api.post(`/api/admin/assign-sho/${policeId}`)
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