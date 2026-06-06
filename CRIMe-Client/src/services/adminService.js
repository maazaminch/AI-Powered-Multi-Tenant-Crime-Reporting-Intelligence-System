import api from "./api";

export const adminService = {

    dashboardStats: async () => {
    const response = await api.get('/api/admin/dashboard-stats')
    return response.data;
    }

}    