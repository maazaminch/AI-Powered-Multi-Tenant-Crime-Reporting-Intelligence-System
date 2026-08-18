import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import CitizenController from "../controllers/citizen /citizen.controller.js";
import { Roles } from "../constants/roles.js";

const citizenRouter = express.Router();

// Dashboard endpoint
citizenRouter.get(
    "/dashboard-stats",
    verifyJWT,
    roleGuard(Roles.CITIZEN),
    CitizenController.dashboardStats
);

// Public endpoint - optional auth (handles both citizen and guest)
// Note: reportCrime derives tenantId from policeStation, not from user
citizenRouter.post(
    "/report-case-citizen",
    verifyJWT,
    roleGuard(Roles.CITIZEN),
    auditLog('CREATE', 'CASE'),
    CitizenController.reportCase
);

// Public endpoint - no auth required
citizenRouter.get(
    "/suggest-nearest-stations",
    CitizenController.suggestNearestStations
);

// Authenticated citizen endpoints
citizenRouter.get(
    "/citizen-cases",
    verifyJWT,
    roleGuard(Roles.CITIZEN),
    CitizenController.citizenCases
);

citizenRouter.get(
    "/case-details/:caseId",
    verifyJWT,
    roleGuard(Roles.CITIZEN),
    CitizenController.caseDetails
);

citizenRouter.get(
    "/case-updates/:caseId",
    verifyJWT,
    roleGuard(Roles.CITIZEN),
    CitizenController.caseUpdates
);

citizenRouter.post(
    "/add-note/:caseId",
    verifyJWT,
    roleGuard(Roles.CITIZEN),
    auditLog('CREATE', 'CASE_UPDATE'),
    CitizenController.addNote
);

citizenRouter.post(
    "/upload-evidence/:caseId",
    verifyJWT,
    roleGuard(Roles.CITIZEN),
    auditLog('UPLOAD', 'EVIDENCE'),
    CitizenController.uploadEvidence
);

export default citizenRouter;
