import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import superAdminController from "../controllers/superadmin/superadmin.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const superAdminRouter = express.Router();


superAdminRouter.get(
    "/get-tenants",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }), 
    superAdminController.getAllTenantsController
);

superAdminRouter.get(
    "/tenant-details/:tenantId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }), 
    superAdminController.getTenantDetails,
);


//tested
superAdminRouter.post(
    "/create-tenant",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }), 
    superAdminController.createTenantController   
);

//tested
superAdminRouter.delete(
    '/delete-tenant/:tenantId',
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }), 
    superAdminController.deleteTenantController
)

//tested
superAdminRouter.put(
    "/activate-or-deactivate-tenant/:tenantId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }), 
    superAdminController.activateOrDeactivateTenantController
);




// Admin Management Routes
superAdminRouter.get(
    "/get-admins",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.getAllAdminsController
);

superAdminRouter.get(
    "/get-admin-details/:adminId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.getAdminDetailsController
);

superAdminRouter.get(
    "/pending-admins",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.getPendingAdmins
);

superAdminRouter.post(
    "/assign-admin/:adminId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }), 
    superAdminController.assignAdminToTenantController   
);


superAdminRouter.post(
    "/transfer-admin/:adminId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.transferAdminController
);

superAdminRouter.get(
    "/dashboard-stats",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.dashboardStatsController
);


// System Analytics Routes
superAdminRouter.get(
    "/system-analytics",
    verifyJWT,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.getSystemAnalyticsController
);

superAdminRouter.get(
    "/admin-performance",
    verifyJWT,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.getAdminPerformanceController
);


superAdminRouter.get(
    "/tenant-analytics",
    verifyJWT,
    roleGuard({ flags: [UserFlags.IS_SUPER_ADMIN] }),
    superAdminController.getTenantAnalyticsController
);

export default superAdminRouter;