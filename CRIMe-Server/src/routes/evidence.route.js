import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import EvidenceController from "../controllers/case management/evidence.controller.js";
import { Roles } from "../constants/roles.js";

const router = express.Router();

// Evidence Management Routes
router.post(
    "/commit-evidence/:id",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN] }),
    EvidenceController.commitEvidence
);

export default router;
