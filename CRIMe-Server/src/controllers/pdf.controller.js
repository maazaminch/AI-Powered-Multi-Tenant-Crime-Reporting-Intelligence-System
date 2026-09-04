import PDFService from "../services/pdf.service.js";
import Case from "../models/case.model.js";
import CaseUpdate from "../models/caseUpdate.model.js";
import Evidence from "../models/evidence.model.js";
import PoliceStation from "../models/policeStation.model.js";
import apiError from "../utils/apiError.js";
import wrapAsync from "../utils/wrapAsync.js";
import apiResponse from "../utils/apiResponse.js";
import fs from "fs";

class PDFController {

    // Guest download receipt (no auth, uses trackingToken) - ONE-TIME ONLY
    static guestDownloadReceipt = wrapAsync(async (req, res) => {
        const { caseId, trackingToken } = req.query;

        if (!caseId || !trackingToken) {
            throw new apiError(400, "caseId and trackingToken are required");
        }

        const caseDoc = await Case.findOne({
            caseId,
            trackingToken,
            "reporter.type": "GUEST"
        });

        if (!caseDoc) {
            throw new apiError(404, "Case not found or invalid tracking token");
        }

        // STRICT: Only one-time download for guests
        if (!caseDoc.guestDownloadAllowed) {
            throw new apiError(403, "Guest receipt can only be downloaded once immediately after case submission. For continued access, please create an account.");
        }

        // If PDF doesn't exist yet (still generating in background), generate it on-demand
        if (!caseDoc.receiptPdf || !fs.existsSync(caseDoc.receiptPdf)) {
            const station = await PoliceStation.findById(caseDoc.policeStationId);
            const stationName = station ? station.name : "Police Station";
            const tenantName = "Police Department";

            const filePath = await PDFService.generateReceipt(caseDoc, stationName, tenantName);
            await Case.findByIdAndUpdate(caseDoc._id, { receiptPdf: filePath });

            // Disable future downloads immediately
            await Case.findByIdAndUpdate(caseDoc._id, { guestDownloadAllowed: false });

            res.download(filePath, `receipt-${caseId}.pdf`);
        } else {
            // Disable future downloads immediately
            await Case.findByIdAndUpdate(caseDoc._id, { guestDownloadAllowed: false });

            // Send existing file
            res.download(caseDoc.receiptPdf, `receipt-${caseId}.pdf`);
        }
    });

    // Download acknowledgment receipt (for authenticated users) - IMMUTABLE
    static downloadReceipt = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        const caseDoc = await Case.findOne({ caseId });
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        // STRICT: Access control
        if (caseDoc.reporter.type === "CITIZEN" && caseDoc.reporter.citizenId.toString() !== currentUser._id.toString()) {
            throw new apiError(403, "You can only download your own case receipt");
        }

        // If PDF doesn't exist yet (still generating in background), generate it on-demand
        if (!caseDoc.receiptPdf || !fs.existsSync(caseDoc.receiptPdf)) {
            const station = await PoliceStation.findById(caseDoc.policeStationId);
            const stationName = station ? station.name : "Police Station";
            const tenantName = "Police Department";

            const filePath = await PDFService.generateReceipt(caseDoc, stationName, tenantName);
            await Case.findByIdAndUpdate(caseDoc._id, { receiptPdf: filePath });
            res.download(filePath, `receipt-${caseId}.pdf`);
        } else {
            // Send existing file - no regeneration, immutable document
            res.download(caseDoc.receiptPdf, `receipt-${caseId}.pdf`);
        }
    });

    // Download final report (when case is closed) - IMMUTABLE
    static downloadFinalReport = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;
        const { version = "citizen" } = req.query; // "citizen" or "full"

        const caseDoc = await Case.findOne({ caseId });
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        if (caseDoc.status !== "CLOSED") {
            throw new apiError(400, "Final report can only be downloaded for closed cases");
        }

        // Check access
        const isFullVersion = version === "full";
        const isReporter = caseDoc.reporter.type === "CITIZEN" && caseDoc.reporter.citizenId.toString() === currentUser._id.toString();
        const isAssigned = caseDoc.assignedTo && caseDoc.assignedTo.toString() === currentUser._id.toString();
        const isStationHead = currentUser.isStationHead;
        const isAdmin = currentUser.role === "ADMIN";
        const isSuperAdmin = currentUser.isSuperAdmin;

        // Citizen/Guest can only download their own case (citizen version)
        if (caseDoc.reporter.type === "CITIZEN" && !isReporter && !isStationHead && !isAdmin && !isSuperAdmin) {
            throw new apiError(403, "You can only download your own case report");
        }

        // Police can only download if assigned or full version not requested
        if (currentUser.role === "POLICE" && !isAssigned && !isStationHead && !isAdmin && !isSuperAdmin) {
            throw new apiError(403, "You can only download assigned case reports");
        }

        // Full version only for authorized personnel
        if (isFullVersion && !isStationHead && !isAdmin && !isSuperAdmin) {
            throw new apiError(403, "Full version only available to authorized personnel");
        }

        // STRICT: PDF must exist (generated at case closure)
        if (!caseDoc.fullPdf || !fs.existsSync(caseDoc.fullPdf)) {
            throw new apiError(404, "Final report PDF not found. This is a system error - please contact support.");
        }

        // Send file - no regeneration, immutable document
        const fileName = isFullVersion ? `final-report-full-${caseId}.pdf` : `final-report-citizen-${caseId}.pdf`;
        res.download(caseDoc.fullPdf, fileName);
    });
}

export default PDFController;
