import wrapAsync from "../utils/wrapAsync.js";
import apiError from "../utils/apiError.js";

import Tenant from "../models/tenant.model.js";
import PoliceStation from "../models/policeStation.model.js";

import { Roles } from "../constants/roles.js";

const tenantGuard = wrapAsync(async (req, res, next) => {

    // Super Admin bypass
    if (req.user.isSuperAdmin) {
        req.tenantFilter = {};
        req.stationFilter = {};
        return next();
    }

    // Citizens bypass (they are global users without tenant context)
    if (req.user.role === Roles.CITIZEN) {
        req.tenantFilter = {};
        req.stationFilter = {};
        return next();
    }

    // User must belong to a tenant
    if (!req.user.tenantId) {
        return next(new apiError(403, "Tenant context missing."));
    }

    // Verify tenant exists
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
        return next(new apiError(403, "Tenant not found."));
    }

    if (!tenant.isActive) {
        return next(new apiError(403, "Tenant is inactive."));
    }

    // Tenant scope
    req.tenantFilter = Object.freeze({
        tenantId: req.user.tenantId
    });

    // Station scope
    if (req.user.isStationHead && req.user.policeStationId) {

        req.stationFilter = Object.freeze({
            policeStationId: req.user.policeStationId
        });

    } else if (
        req.user.role === Roles.POLICE &&
        req.user.policeStationId
    ) {

        req.stationFilter = Object.freeze({
            policeStationId: req.user.policeStationId,
            assignedTo: req.user._id
        });

    } else {

        // Admin
        req.stationFilter = Object.freeze({});
    }

    // Prevent cross-tenant payloads
    if (
        req.body?.tenantId &&
        req.body.tenantId.toString() !== req.user.tenantId.toString()
    ) {
        return next(new apiError(403, "Cross-tenant write blocked."));
    }

    // Validate station assignment
    if (
        req.body?.policeStationId &&
        req.user.role !== Roles.ADMIN &&
        !req.user.isSuperAdmin
    ) {

        const station = await PoliceStation.findById(req.body.policeStationId);

        if (!station) {
            return next(new apiError(404, "Police station not found."));
        }

        if (!station.tenantId.equals(req.user.tenantId)) {
            return next(new apiError(403, "Invalid station assignment."));
        }

        if (
            (req.user.role === Roles.POLICE || req.user.isStationHead) &&
            !station._id.equals(req.user.policeStationId)
        ) {
            return next(new apiError(403, "You can only access your own station."));
        }
    }

    // Force tenant ownership
    if (req.body) {
        req.body.tenantId = req.user.tenantId;
    }

    next();
});

export default tenantGuard;