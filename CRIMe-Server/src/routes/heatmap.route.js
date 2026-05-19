import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import HeatmapController from "../controllers/heatmap/heatmap.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const router = express.Router();

// Heatmap Data Routes
router.get(
    "/data",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    HeatmapController.getHeatmapData
);

router.get(
    "/hotspots",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    HeatmapController.getHotspots
);

router.get(
    "/crime-stats-by-area",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    HeatmapController.getCrimeStatsByArea
);

router.get(
    "/crime-trends",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    HeatmapController.getCrimeTrends
);

router.get(
    "/analytics",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    HeatmapController.getHeatmapAnalytics
);

router.get(
    "/export",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    HeatmapController.exportHeatmapData
);

export default router;
