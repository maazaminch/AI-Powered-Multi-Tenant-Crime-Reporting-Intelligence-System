import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import CaseFileController from "../controllers/utilities/PDF.controller.js";
import { Roles } from "../constants/roles.js";

const router = express.Router();

// PDF Download Routes
router.get(
    "/download/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN] }),
    CaseFileController.downloadPDF
);

export default router;
