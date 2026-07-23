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
    "/delete-station/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
    AdminController.deleteStation   
);

adminRoutes.post(
    "/activate-or-deactivate-station/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }), 
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
    AdminController.assignPoliceToStation
);
adminRoutes.post(
    "/transfer-police/:policeId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.transferPolice
);




// Station Head Management Routes
adminRoutes.post(
    "/assign-or-change-sho/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    AdminController.assignOrChangeStationHead
);

adminRoutes.post(
    "/remove-sho/:stationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
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