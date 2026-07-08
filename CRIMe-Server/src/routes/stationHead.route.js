import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import StationHeadController from "../controllers/stationHead/stationHead.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const stationHeadRouter = express.Router();

//dashboard
stationHeadRouter.get(
    "/dashboard-stats",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.dashboardStats
);

// Station Police Routes
stationHeadRouter.get(
    "/station-police",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getStationPolice
);

stationHeadRouter.get(
    "/station-police-details/:policeId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getPoliceDetails
);

// Station Cases
stationHeadRouter.get(
    "/station-cases",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getStationCases
);


// Case Details
stationHeadRouter.get(
    "/case-details/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getCaseDetails
);

stationHeadRouter.patch(
    "/close-case-status/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.closeCaseStatus
);

stationHeadRouter.post(
    "/add-case-update/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.addCaseUpdate
);

stationHeadRouter.get(
    "/get-case-updates/:caseId", 
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.getCaseUpdates
);

stationHeadRouter.post(
    "/assign-case-to-police/:caseId",
    verifyJWT,
    tenantGuard,
    roleGuard({ flags: [UserFlags.IS_STATION_HEAD] }),
    StationHeadController.assignCaseToPolice
);

stationHeadRouter.post(
    "/reassign-case/:caseId",
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
