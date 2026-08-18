import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import LocationController from "../controllers/utilities/location.controller.js";
import {
    reverseGeocodeSchema,
    nearbyStationsSchema,
    validateLocationSchema,
    distanceCalculationSchema,
    jurisdictionCheckSchema
} from "../validations/location.schema.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Reverse geocode - convert coordinates to address
router.post(
    "/reverse-geocode",
    tenantGuard,
    validate(reverseGeocodeSchema),
    LocationController.reverseGeocode
);

// Find nearby police stations
router.get(
    "/nearby-stations",
    tenantGuard,
    // validate(nearbyStationsSchema),
    LocationController.getNearbyStations
);

// Validate location data
router.post(
    "/validate",
    tenantGuard,
    validate(validateLocationSchema),
    LocationController.validateLocation
);

// Calculate distance between two points
router.post(
    "/distance",
    tenantGuard,
    validate(distanceCalculationSchema),
    LocationController.calculateDistance
);

// Check jurisdiction
router.get(
    "/jurisdiction-check",
    tenantGuard,
    validate(jurisdictionCheckSchema),
    LocationController.checkJurisdiction
);

// Get all tenant stations
router.get(
    "/tenant-stations",
    tenantGuard,
    LocationController.getTenantStations
);

export default router;
