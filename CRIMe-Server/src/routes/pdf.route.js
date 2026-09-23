import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import PDFController from "../controllers/pdf.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const pdfRouter = express.Router();

// Guest download receipt (no auth, one-time only)
pdfRouter.get(
    "/guest-receipt/:caseId",
    // auditLog('DOWNLOAD', 'CASE_RECEIPT'),
    PDFController.guestDownloadReceipt
);

// Download acknowledgment receipt (for authenticated users, immutable)
pdfRouter.get(
    "/receipt/:caseId",
    verifyJWT,
    auditLog('DOWNLOAD', 'CASE_RECEIPT'),
    PDFController.downloadReceipt
);

// Download final report (when case is closed, immutable)
pdfRouter.get(
    "/final-report/:caseId",
    verifyJWT,
    auditLog('DOWNLOAD', 'CASE_REPORT'),
    PDFController.downloadFinalReport
);

export default pdfRouter;
