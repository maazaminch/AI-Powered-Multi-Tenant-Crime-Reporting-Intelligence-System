import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import LocationService from "../../services/location.service.js";

class LocationController {

    /**
     * Reverse geocode coordinates to get address
     * POST /api/v1/location/reverse-geocode
     */
    static reverseGeocode = wrapAsync(async (req, res) => {
        const { latitude, longitude } = req.body;

        const result = await LocationService.reverseGeocode(latitude, longitude);

        if (!result.success) {
            throw new apiError(400, result.error);
        }

        return res
            .status(200)
            .json(new apiResponse(200, result.data, "Address retrieved successfully"));
    });

    /**
     * Find nearby police stations
     * GET /api/v1/location/nearby-stations
     * For citizens: shows all nearby stations (no tenant filter)
     * For authenticated users: filters by tenant if available
     */
    static getNearbyStations = wrapAsync(async (req, res) => {
        const { latitude, longitude, radius } = req.query;
        // tenantId will be undefined for citizens, which is correct
        const tenantId = req.tenantId || null;

        const result = await LocationService.findNearbyStations(
            parseFloat(latitude),
            parseFloat(longitude),
            tenantId,
            radius ? parseFloat(radius) : 10
        );

        if (!result.success) {
            throw new apiError(400, result.error);
        }

        return res
            .status(200)
            .json(new apiResponse(200, result.data, "Nearby stations retrieved successfully"));
    });

    /**
     * Validate location data
     * POST /api/v1/location/validate
     */
    static validateLocation = wrapAsync(async (req, res) => {
        const { location } = req.body;

        const result = await LocationService.validateLocation(location);

        if (!result.success) {
            throw new apiError(400, result.error);
        }

        return res
            .status(200)
            .json(new apiResponse(200, result.data, "Location is valid"));
    });

    /**
     * Calculate distance between two points
     * POST /api/v1/location/distance
     */
    static calculateDistance = wrapAsync(async (req, res) => {
        const { origin, destination } = req.body;

        const result = await LocationService.calculateDistance(
            origin.latitude,
            origin.longitude,
            destination.latitude,
            destination.longitude
        );

        if (!result.success) {
            throw new apiError(400, result.error);
        }

        return res
            .status(200)
            .json(new apiResponse(200, result.data, "Distance calculated successfully"));
    });

    /**
     * Check if location is within station jurisdiction
     * GET /api/v1/location/jurisdiction-check
     */
    static checkJurisdiction = wrapAsync(async (req, res) => {
        const { latitude, longitude, stationId } = req.query;
        const tenantId = req.tenantId;

        const result = await LocationService.isWithinJurisdiction(
            parseFloat(latitude),
            parseFloat(longitude),
            stationId,
            tenantId
        );

        if (!result.success) {
            throw new apiError(400, result.error);
        }

        return res
            .status(200)
            .json(new apiResponse(200, result.data, "Jurisdiction check completed"));
    });

    /**
     * Get all stations for a tenant
     * GET /api/v1/location/tenant-stations
     */
    static getTenantStations = wrapAsync(async (req, res) => {
        const tenantId = req.tenantId;

        const result = await LocationService.getTenantStations(tenantId);

        if (!result.success) {
            throw new apiError(400, result.error);
        }

        return res
            .status(200)
            .json(new apiResponse(200, result.data, "Tenant stations retrieved successfully"));
    });
}

export default LocationController;
