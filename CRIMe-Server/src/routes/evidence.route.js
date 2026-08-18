import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import EvidenceController from "../controllers/Evidence/evidence.controller.js";
import { Roles } from "../constants/roles.js";

const router = express.Router();

// Evidence Management Routes
router.post(
    "/commit-evidence/:id",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN] }),
    auditLog('UPLOAD', 'EVIDENCE'),
    EvidenceController.commitEvidence
);

export default router;
