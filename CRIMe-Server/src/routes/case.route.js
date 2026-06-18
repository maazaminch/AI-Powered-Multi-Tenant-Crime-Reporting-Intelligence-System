import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import caseController from "../controllers/case management/case.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const caseRouter = express.Router();


caseRouter.post(
    "/create-full-case",
    verifyJWT,
    tenantGuard,
    roleGuard(Roles.CITIZEN),
    caseController.createFullCaseController
);

caseRouter.post(
    "/create-anonymous-case",
    caseController.createAnonymousCaseController
);

caseRouter.get(
    "/search-case",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    caseController.searchCaseController
);

// caseRouter.patch(
//     '/update-case-status',
//     verifyJWT,
//     tenantGuard,
//     roleGuard(Roles.POLICE, Roles.ADMIN),
//     caseController.updateCaseController
// )

caseRouter.patch(
    '/update-case-status/:caseId',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE, Roles.ADMIN] }),
    caseController.updateCaseStatus
)

caseRouter.get(
    '/get-assigned-cases',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE] }),
    caseController.getAssignedCases
)

export default caseRouter;