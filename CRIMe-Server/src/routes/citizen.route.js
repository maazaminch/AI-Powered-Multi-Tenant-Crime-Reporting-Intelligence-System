import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import CitizenController from "../controllers/citizen /citizen.controller.js";
import { Roles } from "../constants/roles.js";
import validate from "../middlewares/validate.middleware.js";
import {
    reportCaseSchema,
    suggestNearestStationsSchema,
    getCitizenCasesSchema,
    getCaseDetailsSchema,
    getCaseUpdatesSchema,
    addNoteSchema
} from "../validations/case.schema.js";

const citizenRouter = express.Router();

// Dashboard endpoint
citizenRouter.get(
    "/dashboard-stats",
    verifyJWT,
    roleGuard({ roles: [Roles.CITIZEN] }),
    CitizenController.dashboardStats
);

// Public endpoint - optional auth (handles both citizen and guest)
// Note: reportCrime derives tenantId from policeStation, not from user
citizenRouter.post(
    "/report-case-citizen",
    verifyJWT,
    roleGuard({ roles: [Roles.CITIZEN] }),
    validate(reportCaseSchema),
    auditLog('REPORT', 'CASE'),
    CitizenController.reportCase
);

// Public endpoint - no auth required
citizenRouter.get(
    "/suggest-nearest-stations",
    validate(suggestNearestStationsSchema),
    CitizenController.suggestNearestStations
);

// Authenticated citizen endpoints
citizenRouter.get(
    "/citizen-cases",
    verifyJWT,
    roleGuard({ roles: [Roles.CITIZEN] }),
    validate(getCitizenCasesSchema),
    CitizenController.citizenCases
);

citizenRouter.get(
    "/case-details/:caseId",
    verifyJWT,
    roleGuard({ roles: [Roles.CITIZEN] }),
    validate(getCaseDetailsSchema),
    CitizenController.caseDetails
);

citizenRouter.get(
    "/case-updates/:caseId",
    verifyJWT,
    roleGuard({ roles: [Roles.CITIZEN] }),
    validate(getCaseUpdatesSchema),
    CitizenController.caseUpdates
);

citizenRouter.post(
    "/add-note/:caseId",
    verifyJWT,
    roleGuard({ roles: [Roles.CITIZEN] }),
    validate(addNoteSchema),
    auditLog('ADD', 'CASE_UPDATE'),
    CitizenController.addNote
);

export default citizenRouter;
