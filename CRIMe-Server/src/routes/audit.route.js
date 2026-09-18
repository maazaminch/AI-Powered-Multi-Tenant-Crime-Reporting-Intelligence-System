import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import AuditController from "../controllers/audit/audit.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";
import { getAuditLogsSchema, getAuditLogByIdSchema, getUserActivitySchema, getUserActivityQuerySchema } from "../validations/audit.schema.js";

const auditRouter = express.Router();


auditRouter.get(
  "/logs",
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.ADMIN] }),
  // validate(getAuditLogsSchema, 'query'),
  AuditController.getAuditLogs
);

//  Get audit statistics
auditRouter.get(
  "/stats",
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.ADMIN] }),
  AuditController.getAuditStats
);

auditRouter.get(
  "/recent-activities",
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.ADMIN] }),
  AuditController.recentActivities
);

export default auditRouter;