import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import StationHeadController from "../controllers/stationHead/stationHead.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const stationHeadRouter = express.Router();

// Police Management Routes
stationHeadRouter.get(
    "/station-police",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getStationPolice
);

stationHeadRouter.post(
    "/assign-case-to-police",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.assignCaseToPolice
);

stationHeadRouter.post(
    "/reassign-case",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.reassignCase
);

stationHeadRouter.get(
    "/police-performance/:policeId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getPolicePerformance
);

// Case Management Routes
stationHeadRouter.get(
    "/station-cases",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getStationCases
);

stationHeadRouter.get(
    "/pending-cases",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getPendingCases
);

stationHeadRouter.get(
    "/case-details/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getCaseDetails
);

stationHeadRouter.patch(
    "/update-case-status/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.updateCaseStatus
);

// Station Operations Routes
stationHeadRouter.get(
    "/station-details",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getStationDetails
);

stationHeadRouter.get(
    "/station-analytics",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getStationAnalytics
);

export default stationHeadRouter;
