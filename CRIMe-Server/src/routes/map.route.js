import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import MapController from "../controllers/utilities/map.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Single heatmap endpoint - accessible by all authenticated users
router.get(
    "/heatmap",
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    MapController.getHeatmapData
);

export default router;
