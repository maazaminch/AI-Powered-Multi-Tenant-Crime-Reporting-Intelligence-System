import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import AdminController from "../controllers/admin/admin.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const adminRoutes = express.Router();



// Station
adminRoutes.post(
    "/create-station",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
    AdminController.createStation   
);

adminRoutes.delete(
    "/delete-station",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
    AdminController.deleteStation   
);

adminRoutes.post(
    "/actOrDeact-station",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
    AdminController.activateOrDeactivateStation   
);

adminRoutes.post(
    "/get-stations",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
    AdminController.getStations   
);

adminRoutes.post(
    "/get-station-detail",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
    AdminController.getStationDetails   
);

// Police Management Routes
adminRoutes.get(
    "/pending-police",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    AdminController.getPendingPolice
);

// Station Head Management Routes
adminRoutes.post(
    "/assign-station-head",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.assignStationHead
);

adminRoutes.delete(
    "/remove-station-head/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.removeStationHead
);

adminRoutes.post(
    "/transfer-station-head",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.transferStationHead
);

adminRoutes.get(
    "/station-head/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.getStationHead
);

// Case Management Routes
adminRoutes.get(
    "/station-cases",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.getStationCases
);

adminRoutes.get(
    "/pending-cases",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.getPendingCases
);

// Analytics Dashboard Routes
adminRoutes.get(
    "/analytics",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    AdminController.getAdminAnalytics
);

export default adminRoutes;