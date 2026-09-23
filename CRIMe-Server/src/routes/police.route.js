import express from "express";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import PoliceController from "../controllers/police/police.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";
import validate from "../middlewares/validate.middleware.js";
import { toggleCitizenEvidenceUploadSchema } from "../validations/case.schema.js";

const policeRouter = express.Router();


policeRouter.get(
    '/dashboard-stats',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE] }),
    PoliceController.dashboardStats
)


policeRouter.get(
    '/my-cases',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE] }),
    PoliceController.getMyCases
)


policeRouter.post(
    '/add-case-update/:caseId',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE] }),
    auditLog('ADD', 'CASE_UPDATE'),
    PoliceController.addCaseUpdate
)


policeRouter.patch(
    '/update-case-status/:caseId',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE] }),
    auditLog('UPDATE', 'CASE_STATUS'),
    PoliceController.updateCaseStatus
)

policeRouter.get(
    '/case-details/:caseId',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE] }),
    PoliceController.getCaseDetails
)

policeRouter.get(
    '/case-updates/:caseId',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE] }),
    PoliceController.getCaseUpdates
)

policeRouter.patch(
  '/toggle-citizen-evidence/:caseId',
  verifyJWT,
  tenantGuard,
  roleGuard({ roles: [Roles.POLICE] }),  
  validate(toggleCitizenEvidenceUploadSchema),
  auditLog('TOGGLE', 'EVIDENCE'),
  PoliceController.toggleCitizenEvidenceUpload
);

export default policeRouter;