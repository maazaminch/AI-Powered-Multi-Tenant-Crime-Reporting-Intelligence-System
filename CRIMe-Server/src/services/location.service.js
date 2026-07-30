import PoliceStation from "../models/policeStation.model.js";
import LocationHelper from "../utils/location.helper.js";
import axios from "axios";

class LocationService {
    
    /**
     * Reverse geocode coordinates to get address
     * Uses Nominatim (OpenStreetMap) - Free tier
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @returns {Object} { success, data, error }
     */
    static async reverseGeocode(latitude, longitude) {
        try {
            // Validate coordinates
            if (!LocationHelper.isValidLatitude(latitude) || !LocationHelper.isValidLongitude(longitude)) {
                return {
                    success: false,
                    error: 'Invalid coordinates'
                };
            }

            // Call Nominatim API
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse`,
                {
                    params: {
                        format: 'json',
                        lat: latitude,
                        lon: longitude,
                        zoom: 18,
                        addressdetails: 1
                    },
                    headers: {
                        'User-Agent': 'Crime-SaaS-Location-Service'
                    }
                }
            );

            if (response.data && response.data.display_name) {
                return {
                    success: true,
                    data: {
                        address: response.data.display_name,
                        formattedAddress: response.data.display_name,
                        details: response.data.address || {},
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude)
                    }
                };
            }

            return {
                success: false,
                error: 'Unable to reverse geocode coordinates'
            };

        } catch (error) {
            console.error('Reverse geocoding error:', error.message);
            
            // Return coordinates as fallback if API fails
            return {
                success: true,
                data: {
                    address: LocationHelper.formatCoordinates(latitude, longitude),
                    formattedAddress: LocationHelper.formatCoordinates(latitude, longitude),
                    details: {},
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    isFallback: true
                }
            };
        }
    }

    /**
     * Find nearby police stations
     * For citizens: shows all nearby stations regardless of tenant
     * For authenticated users: filters by tenant if tenantId is provided
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @param {string} tenantId - Tenant ID (optional)
     * @param {number} radiusKm - Search radius in kilometers
     * @returns {Object} { success, data, error }
     */
    static async findNearbyStations(latitude, longitude, tenantId = null, radiusKm = 10) {
        try {
            // Validate coordinates
            if (!LocationHelper.isValidLatitude(latitude) || !LocationHelper.isValidLongitude(longitude)) {
                return {
                    success: false,
                    error: 'Invalid coordinates'
                };
            }

            // Convert to GeoJSON format [longitude, latitude]
            const coordinates = LocationHelper.toGeoJSON([latitude, longitude]);

            // Build geospatial query
            const query = {
                isActive: true,
                deletedAt: { $exists: false },
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: coordinates
                        },
                        $maxDistance: radiusKm * 1000 // Convert to meters
                    }
                }
            };

            // Only add tenant filter if tenantId is provided (not for citizens)
            if (tenantId) {
                query.tenantId = tenantId;
            }

            // Find nearby stations
            const stations = await PoliceStation.find(query)
                .select('name code location locationLabel address city contactNumber stationHead tenantId')
                .lean();

            // Calculate distance for each station
            const stationsWithDistance = stations.map(station => {
                const distance = LocationHelper.calculateDistanceGeoJSON(
                    coordinates,
                    station.location.coordinates
                );

                return {
                    ...station,
                    distance: parseFloat(distance.toFixed(2)),
                    distanceUnit: 'km'
                };
            });

            // Sort by distance
            stationsWithDistance.sort((a, b) => a.distance - b.distance);

            return {
                success: true,
                data: {
                    stations: stationsWithDistance,
                    total: stationsWithDistance.length,
                    searchCenter: {
                        latitude,
                        longitude
                    },
                    radiusKm
                }
            };

        } catch (error) {
            console.error('Find nearby stations error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate location data
     * @param {Object} location - Location object
     * @returns {Object} { success, data, error }
     */
    static validateLocation(location) {
        try {
            if (!location || typeof location !== 'object') {
                return {
                    success: false,
                    error: 'Location object is required'
                };
            }

            // Check if it's a valid GeoJSON Point
            if (!LocationHelper.isValidLocation(location)) {
                return {
                    success: false,
                    error: 'Invalid GeoJSON Point format'
                };
            }

            return {
                success: true,
                data: {
                    isValid: true,
                    location: location
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Calculate distance between two points
     * @param {number} lat1 - Latitude of first point
     * @param {number} lng1 - Longitude of first point
     * @param {number} lat2 - Latitude of second point
     * @param {number} lng2 - Longitude of second point
     * @returns {Object} { success, data, error }
     */
    static calculateDistance(lat1, lng1, lat2, lng2) {
        try {
            // Validate coordinates
            if (!LocationHelper.isValidLatitude(lat1) || !LocationHelper.isValidLongitude(lng1)) {
                return {
                    success: false,
                    error: 'Invalid origin coordinates'
                };
            }

            if (!LocationHelper.isValidLatitude(lat2) || !LocationHelper.isValidLongitude(lng2)) {
                return {
                    success: false,
                    error: 'Invalid destination coordinates'
                };
            }

            const distance = LocationHelper.calculateDistance(lat1, lng1, lat2, lng2);

            return {
                success: true,
                data: {
                    distance: parseFloat(distance.toFixed(2)),
                    unit: 'km',
                    origin: { latitude: lat1, longitude: lng1 },
                    destination: { latitude: lat2, longitude: lng2 }
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if a location is within a station's jurisdiction
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @param {string} stationId - Station ID
     * @param {string} tenantId - Tenant ID
     * @returns {Object} { success, data, error }
     */
    static async isWithinJurisdiction(latitude, longitude, stationId, tenantId) {
        try {
            // Validate coordinates
            if (!LocationHelper.isValidLatitude(latitude) || !LocationHelper.isValidLongitude(longitude)) {
                return {
                    success: false,
                    error: 'Invalid coordinates'
                };
            }

            // Find the station
            const station = await PoliceStation.findOne({
                _id: stationId,
                tenantId,
                isActive: true,
                deletedAt: { $exists: false }
            }).lean();

            if (!station) {
                return {
                    success: false,
                    error: 'Station not found'
                };
            }

            // Calculate distance to station
            const coordinates = LocationHelper.toGeoJSON([latitude, longitude]);
            const distance = LocationHelper.calculateDistanceGeoJSON(
                coordinates,
                station.location.coordinates
            );

            // Default jurisdiction radius: 5km
            const jurisdictionRadius = 5;

            return {
                success: true,
                data: {
                    isWithinJurisdiction: distance <= jurisdictionRadius,
                    distance: parseFloat(distance.toFixed(2)),
                    jurisdictionRadius,
                    station: {
                        id: station._id,
                        name: station.name,
                        code: station.code
                    }
                }
            };

        } catch (error) {
            console.error('Jurisdiction check error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all stations for a tenant (for dropdown selection)
     * @param {string} tenantId - Tenant ID
     * @returns {Object} { success, data, error }
     */
    static async getTenantStations(tenantId) {
        try {
            const stations = await PoliceStation.find({
                tenantId,
                isActive: true,
                deletedAt: { $exists: false }
            })
            .select('name code location locationLabel address city')
            .sort({ name: 1 })
            .lean();

            return {
                success: true,
                data: {
                    stations,
                    total: stations.length
                }
            };

        } catch (error) {
            console.error('Get tenant stations error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default LocationService;
