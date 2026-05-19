import wrapAsync from "../utils/wrapAsync.js";
import apiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import PoliceStation from "../models/policeStation.model.js";

const validateStationHead = (stationIdParam = "stationId") => {
    return wrapAsync(async (req, res, next) => {
        const user = req.user;
        const stationId = req.params[stationIdParam] || req.body.stationId;

        if (!stationId) {
            return next(new apiError(400, "Station ID is required"));
        }

        // SuperAdmin can access any station
        if (user.isSuperAdmin) {
            req.stationFilter = {};
            return next();
        }

        // User must be a station head
        if (!user.isStationHead) {
            return next(new apiError(403, "Only station heads can perform this action"));
        }

        // Validate station exists
        const station = await PoliceStation.findById(stationId);
        if (!station) {
            return next(new apiError(404, "Police station not found"));
        }

        // Station head must belong to this station
        if (user.policeStationId?.toString() !== stationId) {
            return next(new apiError(403, "You can only perform actions on your own station"));
        }

        // Station head must be the current head of this station
        if (station.stationHead?.toString() !== user._id.toString()) {
            return next(new apiError(403, "You are not the station head of this station"));
        }

        // Tenant isolation
        if (station.tenantId.toString() !== user.tenantId.toString()) {
            return next(new apiError(403, "Access denied"));
        }

        // Add station filter for queries
        req.stationFilter = { policeStationId: stationId };
        req.station = station;

        next();
    });
};

const ensureOneStationHeadPerStation = wrapAsync(async (req, res, next) => {
    const { stationId } = req.params;
    const { policeId } = req.body;

    if (!stationId || !policeId) {
        return next();
    }

    // Check if police is already head of another station
    const existingStation = await PoliceStation.findOne({ stationHead: policeId });
    if (existingStation && existingStation._id.toString() !== stationId) {
        return next(new apiError(400, `Police officer is already head of ${existingStation.stationName}`));
    }

    // Check if station already has a head (and it's not this police)
    const station = await PoliceStation.findById(stationId);
    if (station && station.stationHead && station.stationHead.toString() !== policeId) {
        const currentHead = await User.findById(station.stationHead).select('fullName');
        return next(new apiError(400, `Station already has a head: ${currentHead?.fullName}`));
    }

    next();
});

const stationScopeGuard = () => {
    return wrapAsync(async (req, res, next) => {
        const user = req.user;

        // SuperAdmin bypasses station scope
        if (user.isSuperAdmin) {
            req.stationFilter = {};
            return next();
        }

        // Station heads get station-scoped access
        if (user.isStationHead && user.policeStationId) {
            req.stationFilter = { policeStationId: user.policeStationId };
            return next();
        }

        // Regular police get their assigned cases only
        if (user.role === "POLICE") {
            req.stationFilter = { 
                policeStationId: user.policeStationId,
                assignedTo: user._id 
            };
            return next();
        }

        // Admins get tenant-wide access (handled by tenantGuard)
        req.stationFilter = {};
        next();
    });
};

const canAccessStation = (stationIdParam = "stationId") => {
    return wrapAsync(async (req, res, next) => {
        const user = req.user;
        const stationId = req.params[stationIdParam] || req.body.stationId;

        if (!stationId) {
            return next(new apiError(400, "Station ID is required"));
        }

        // SuperAdmin can access any station
        if (user.isSuperAdmin) {
            return next();
        }

        // Validate station exists
        const station = await PoliceStation.findById(stationId);
        if (!station) {
            return next(new apiError(404, "Police station not found"));
        }

        // Tenant isolation
        if (station.tenantId.toString() !== user.tenantId.toString()) {
            return next(new apiError(403, "Access denied"));
        }

        // Admin can access any station in their tenant
        if (user.role === "ADMIN") {
            return next();
        }

        // Station head can access their own station
        if (user.isStationHead && user.policeStationId?.toString() === stationId) {
            return next();
        }

        // Police can access their own station
        if (user.role === "POLICE" && user.policeStationId?.toString() === stationId) {
            return next();
        }

        return next(new apiError(403, "Access denied"));
    });
};

export {
    validateStationHead,
    ensureOneStationHeadPerStation,
    stationScopeGuard,
    canAccessStation
};

export default validateStationHead;
