// Location Helper Functions for Geospatial Operations

class LocationHelper {
    
    /**
     * Validate latitude coordinate
     * @param {number} lat - Latitude
     * @returns {boolean}
     */
    static isValidLatitude(lat) {
        return typeof lat === 'number' && lat >= -90 && lat <= 90;
    }

    /**
     * Validate longitude coordinate
     * @param {number} lng - Longitude
     * @returns {boolean}
     */
    static isValidLongitude(lng) {
        return typeof lng === 'number' && lng >= -180 && lng <= 180;
    }

    /**
     * Validate GeoJSON Point coordinates
     * @param {Array} coordinates - [longitude, latitude]
     * @returns {boolean}
     */
    static isValidGeoJSONPoint(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return false;
        }
        const [lng, lat] = coordinates;
        return this.isValidLongitude(lng) && this.isValidLatitude(lat);
    }

    /**
     * Validate complete location object
     * @param {Object} location - Location object with type and coordinates
     * @returns {boolean}
     */
    static isValidLocation(location) {
        if (!location || typeof location !== 'object') {
            return false;
        }
        return location.type === 'Point' && this.isValidGeoJSONPoint(location.coordinates);
    }

    /**
     * Convert [lat, lng] to GeoJSON [lng, lat] format
     * @param {Array} latLng - [latitude, longitude]
     * @returns {Array} [longitude, latitude]
     */
    static toGeoJSON(latLng) {
        if (!Array.isArray(latLng) || latLng.length !== 2) {
            throw new Error('Invalid lat/lng format');
        }
        const [lat, lng] = latLng;
        if (!this.isValidLatitude(lat) || !this.isValidLongitude(lng)) {
            throw new Error('Invalid coordinates');
        }
        return [lng, lat];
    }

    /**
     * Convert GeoJSON [lng, lat] to [lat, lng] format
     * @param {Array} geoJSON - [longitude, latitude]
     * @returns {Array} [latitude, longitude]
     */
    static fromGeoJSON(geoJSON) {
        if (!Array.isArray(geoJSON) || geoJSON.length !== 2) {
            throw new Error('Invalid GeoJSON format');
        }
        const [lng, lat] = geoJSON;
        if (!this.isValidLongitude(lng) || !this.isValidLatitude(lat)) {
            throw new Error('Invalid coordinates');
        }
        return [lat, lng];
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {number} lat1 - Latitude of first point
     * @param {number} lng1 - Longitude of first point
     * @param {number} lat2 - Latitude of second point
     * @param {number} lng2 - Longitude of second point
     * @returns {number} Distance in kilometers
     */
    static calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Calculate distance between two GeoJSON points
     * @param {Array} coords1 - [longitude, latitude]
     * @param {Array} coords2 - [longitude, latitude]
     * @returns {number} Distance in kilometers
     */
    static calculateDistanceGeoJSON(coords1, coords2) {
        const [lng1, lat1] = coords1;
        const [lng2, lat2] = coords2;
        return this.calculateDistance(lat1, lng1, lat2, lng2);
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees
     * @returns {number}
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     * @param {number} radians
     * @returns {number}
     */
    static toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Calculate bounding box for a given center point and radius
     * @param {number} lat - Center latitude
     * @param {number} lng - Center longitude
     * @param {number} radiusKm - Radius in kilometers
     * @returns {Object} Bounding box { north, south, east, west }
     */
    static calculateBoundingBox(lat, lng, radiusKm) {
        const latChange = this.toDegrees(radiusKm / 6371);
        const lngChange = this.toDegrees(radiusKm / (6371 * Math.cos(this.toRadians(lat))));

        return {
            north: lat + latChange,
            south: lat - latChange,
            east: lng + lngChange,
            west: lng - lngChange
        };
    }

    /**
     * Build MongoDB geospatial query for nearby locations
     * @param {Array} coordinates - [longitude, latitude]
     * @param {number} maxDistanceKm - Maximum distance in kilometers
     * @returns {Object} MongoDB query object
     */
    static buildNearbyQuery(coordinates, maxDistanceKm) {
        return {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    },
                    $maxDistance: maxDistanceKm * 1000 // Convert to meters
                }
            }
        };
    }

    /**
     * Build MongoDB geospatial query for locations within a bounding box
     * @param {Object} bounds - { north, south, east, west }
     * @returns {Object} MongoDB query object
     */
    static buildBoundingBoxQuery(bounds) {
        return {
            location: {
                $geoWithin: {
                    $box: [
                        [bounds.west, bounds.south], // Southwest corner
                        [bounds.east, bounds.north]  // Northeast corner
                    ]
                }
            }
        };
    }

    /**
     * Format coordinates for display
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {number} precision - Decimal places (default: 6)
     * @returns {string} Formatted coordinates
     */
    static formatCoordinates(lat, lng, precision = 6) {
        return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
    }

    /**
     * Parse coordinate string to array
     * @param {string} coordString - "lat, lng" format
     * @returns {Array} [latitude, longitude]
     */
    static parseCoordinates(coordString) {
        const parts = coordString.split(',').map(s => parseFloat(s.trim()));
        if (parts.length !== 2 || parts.some(isNaN)) {
            throw new Error('Invalid coordinate string format');
        }
        return parts;
    }
}

export default LocationHelper;
