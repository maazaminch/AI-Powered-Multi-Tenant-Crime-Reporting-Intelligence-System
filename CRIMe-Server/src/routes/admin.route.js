import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import AdminController from "../controllers/admin/admin.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const adminRoutes = express.Router();



// Station
adminRoutes.post(
    "/create-station",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    auditLog('CREATE', 'POLICE_STATION'),
    AdminController.createStation   
);

adminRoutes.delete(
    "/delete-station/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    auditLog('DELETE', 'POLICE_STATION'),
    AdminController.deleteStation   
);

adminRoutes.post(
    "/activate-or-deactivate-station/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    auditLog('UPDATE', 'POLICE_STATION'),
    AdminController.activateOrDeactivateStation   
);  

adminRoutes.get(
    "/get-stations",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
    AdminController.getStations   
);

adminRoutes.get(
    "/get-station-details/:stationId",
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
    roleGuard({ roles: [Roles.ADMIN]}),
    AdminController.getPendingPolice
);

adminRoutes.get(
    "/get-all-police",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.getAllPolice
);

adminRoutes.get(
    "/stations-dropdown",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.stationsDropdown
);


// Police-specific endpoints
adminRoutes.get(
    "/get-police-details/:policeId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.getPoliceDetails
);

adminRoutes.post(
    "/assign-police/:policeId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    auditLog('UPDATE', 'STATION_ASSIGNMENT'),
    AdminController.assignPoliceToStation
);
adminRoutes.post(
    "/transfer-police/:policeId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    auditLog('UPDATE', 'STATION_ASSIGNMENT'),
    AdminController.transferPolice
);




// Station Head Management Routes
adminRoutes.post(
    "/assign-or-change-sho/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    auditLog('UPDATE', 'STATION_ASSIGNMENT'),
    AdminController.assignOrChangeStationHead
);

adminRoutes.post(
    "/remove-sho/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    auditLog('UPDATE', 'STATION_ASSIGNMENT'),
    AdminController.removeStationHead
);




// Case Monitoring Routes
adminRoutes.get(
    "/tenant-cases",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.tenantCases
);

adminRoutes.get(
    "/case-details/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.caseDetails
);

adminRoutes.get(
    "/case-updates/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.caseUpdates
);
// Analytics Dashboard Routes

adminRoutes.get(
    "/dashboard-stats",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.dashboardStats
);

adminRoutes.get(
    "/tenant-analytics",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.getTenantAnalytics
);


export default adminRoutes;