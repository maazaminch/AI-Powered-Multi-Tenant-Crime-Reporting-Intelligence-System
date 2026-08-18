import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import AuditController from "../controllers/audit/audit.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";
import { getAuditLogsSchema, getAuditLogByIdSchema, getUserActivitySchema, getUserActivityQuerySchema } from "../validations/audit.schema.js";

const auditRouter = express.Router();

/**
 * Get audit logs with role-based access control
 * Super Admin: Can see all tenant logs, filter by tenant
 * Regular Admin: Can only see their own tenant logs
 */
auditRouter.get(
  "/logs",
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.ADMIN] }),
  // validate(getAuditLogsSchema, 'query'),
  AuditController.getAuditLogs
);

/**
 * Get audit log by ID with access control
 */
auditRouter.get(
  "/logs/:id",
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.ADMIN] }),
  // validate(getAuditLogByIdSchema, 'params'),
  AuditController.getAuditLogById
);

/**
 * Get audit statistics
 */
auditRouter.get(
  "/stats",
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.ADMIN] }),
  AuditController.getAuditStats
);

/**
 * Get user activity logs
 */
auditRouter.get(
  "/user-activity/:userId",
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.ADMIN] }),
  // validate(getUserActivitySchema, 'params'),
  // validate(getUserActivityQuerySchema, 'query'),
  AuditController.getUserActivity
);

export default auditRouter;