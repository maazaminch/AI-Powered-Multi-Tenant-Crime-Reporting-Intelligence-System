import api from './api'

export const locationService = {
    
    reverseGeocode: async (latitude, longitude) => {
        const response = await api.post('/api/v1/location/reverse-geocode', { latitude, longitude })
        return response.data
    },

    getNearbyStations: async (latitude, longitude, radius = 10) => {
        const response = await api.get('/api/v1/location/nearby-stations', { 
            params: { latitude, longitude, radius }
        })
        return response.data
    },

    validateLocation: async (location) => {
        const response = await api.post('/api/v1/location/validate', { location })
        return response.data
    },

    calculateDistance: async (origin, destination) => {
        const response = await api.post('/api/v1/location/distance', { origin, destination })
        return response.data
    },

    checkJurisdiction: async (latitude, longitude, stationId) => {
        const response = await api.get('/api/v1/location/jurisdiction-check', { 
            params: { latitude, longitude, stationId }
        })
        return response.data
    },

    getTenantStations: async () => {
        const response = await api.get('/api/v1/location/tenant-stations')
        return response.data
    }
}
