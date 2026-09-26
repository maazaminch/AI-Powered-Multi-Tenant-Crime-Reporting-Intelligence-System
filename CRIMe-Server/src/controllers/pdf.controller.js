import PDFService from "../services/pdf.service.js";
import Case from "../models/case.model.js";
import CaseUpdate from "../models/caseUpdate.model.js";
import Evidence from "../models/evidence.model.js";
import PoliceStation from "../models/policeStation.model.js";
import Tenant from "../models/tenant.model.js";
import apiError from "../utils/apiError.js";
import wrapAsync from "../utils/wrapAsync.js";
import apiResponse from "../utils/apiResponse.js";
// import fs from "fs";

class PDFController {

    // these controllers save pdfs locally
//     static guestDownloadReceipt = wrapAsync(async (req, res) => {
//     const { caseId } = req.params;
//     const { trackingToken } = req.query;

//     // console.log('[guestDownloadReceipt] hit with', { caseId, trackingToken });

//     if (!caseId || !trackingToken) {
//         throw new apiError(400, "caseId and trackingToken are required");
//     }


//     const caseDoc = await Case.findOne({
//         _id: caseId,
//         trackingToken,
//         "reporter.type": "GUEST"
//     });

//     // console.log('[guestDownloadReceipt] caseDoc found:', !!caseDoc);

//     if (!caseDoc) {
//         throw new apiError(404, "Case not found or invalid tracking token");
//     }

//     // if (!caseDoc.guestDownloadAllowed) {
//     //     throw new apiError(403, "Guest receipt can only be downloaded once immediately after case submission. For continued access, please create an account.");
//     // }

//     const fileExists = caseDoc.receiptPdf && fs.existsSync(caseDoc.receiptPdf);
//     console.log('[guestDownloadReceipt] receiptPdf path:', caseDoc.receiptPdf, 'exists:', fileExists, 'cwd:', process.cwd());

//     if (!fileExists) {
//         const station = await PoliceStation.findById(caseDoc.policeStationId)
//             .populate('stationHead', 'fullName email phone badgeNumber');
//         const tenant = await Tenant.findById(caseDoc.tenantId);

//         const filePath = await PDFService.generateReceipt(caseDoc, station, tenant);
//         await Case.findByIdAndUpdate(caseDoc._id, { receiptPdf: filePath, guestDownloadAllowed: false });

//         res.download(filePath, `receipt-${caseId}.pdf`, (err) => {
//             if (err) console.error('[guestDownloadReceipt] res.download (regenerated) failed:', err);
//         });
//     } else {
//         await Case.findByIdAndUpdate(caseDoc._id, { guestDownloadAllowed: false });

//         res.download(caseDoc.receiptPdf, `receipt-${caseId}.pdf`, (err) => {
//             if (err) console.error('[guestDownloadReceipt] res.download (existing) failed:', err);
//         });
//     }
// });

//     // Download acknowledgment receipt (for authenticated users) - IMMUTABLE
//     static downloadReceipt = wrapAsync(async (req, res) => {
//         const { caseId } = req.params;
//         const currentUser = req.user;

//         const caseDoc = await Case.findOne({ _id: caseId });
//         if (!caseDoc) {
//             throw new apiError(404, "Case not found");
//         }

//         // STRICT: Access control
//         if (caseDoc.reporter.type === "CITIZEN" && caseDoc.reporter.citizenId.toString() !== currentUser._id.toString()) {
//             throw new apiError(403, "You can only download your own case receipt");
//         }

//         // If PDF doesn't exist yet (still generating in background), generate it on-demand
//         if (!caseDoc.receiptPdf || !fs.existsSync(caseDoc.receiptPdf)) {
//             const station = await PoliceStation.findById(caseDoc.policeStationId)
//             .populate('stationHead', 'fullName email phone badgeNumber');
//             const tenant = await Tenant.findById(caseDoc.tenantId);

//             const filePath = await PDFService.generateReceipt(caseDoc, station, tenant);
//             await Case.findByIdAndUpdate(caseDoc._id, { receiptPdf: filePath });
//             res.download(filePath, `receipt-${caseId}.pdf`);
//         } else {
//             // Send existing file - no regeneration, immutable document
//             res.download(caseDoc.receiptPdf, `receipt-${caseId}.pdf`);
//         }
//     });

//     // Download final report (when case is closed) - IMMUTABLE
//     static downloadFinalReport = wrapAsync(async (req, res) => {
//         const { caseId } = req.params;
//         const currentUser = req.user;
//         const { version = "citizen" } = req.query; // "citizen" or "full"

//         const caseDoc = await Case.findOne({ _id: caseId })
//         .populate('assignedTo', 'fullName email phone badgeNumber');
        
//         if (!caseDoc) {
//             throw new apiError(404, "Case not found");
//         }

//         if (caseDoc.status !== "CLOSED") {
//             throw new apiError(400, "Final report can only be downloaded for closed cases");
//         }

//         // Check access
//         const isFullVersion = version === "full";
//         const isReporter = caseDoc.reporter.type === "CITIZEN" && caseDoc.reporter.citizenId.toString() === currentUser._id.toString();
//         const isAssigned = caseDoc.assignedTo && caseDoc.assignedTo.toString() === currentUser._id.toString();
//         const isStationHead = currentUser.isStationHead;
//         const isAdmin = currentUser.role === "ADMIN";
//         const isSuperAdmin = currentUser.isSuperAdmin;

//         // Citizen/Guest can only download their own case (citizen version)
//         if (caseDoc.reporter.type === "CITIZEN" && !isReporter && !isStationHead && !isAdmin && !isSuperAdmin) {
//             throw new apiError(403, "You can only download your own case report");
//         }

//         // Police can only download if assigned or full version not requested
//         if (currentUser.role === "POLICE" && !isAssigned && !isStationHead && !isAdmin && !isSuperAdmin) {
//             throw new apiError(403, "You can only download assigned case reports");
//         }

//         // Full version only for authorized personnel
//         if (isFullVersion && !isStationHead && !isAdmin && !isSuperAdmin) {
//             throw new apiError(403, "Full version only available to authorized personnel");
//         }

//         // STRICT: PDF must exist (generated at case closure)
//         let pdfPath = isFullVersion ? caseDoc.fullPdf : caseDoc.citizenPdf;

//         // If PDF doesn't exist, generate it on-demand (for cases closed before this feature)
//         if (!pdfPath || !fs.existsSync(pdfPath)) {
//             const updates = await CaseUpdate.find({ caseId: caseDoc._id })
//                 .sort({ createdAt: 1 })
//                 .lean();
//             const evidenceCount = await Evidence.countDocuments({ caseId: caseDoc._id });

//             pdfPath = await PDFService.generateFullCase(caseDoc, updates, evidenceCount, isFullVersion);

//             // Save the generated PDF path
//             if (isFullVersion) {
//                 await Case.findByIdAndUpdate(caseDoc._id, { fullPdf: pdfPath });
//             } else {
//                 await Case.findByIdAndUpdate(caseDoc._id, { citizenPdf: pdfPath });
//             }
//         }

//         // Send file - no regeneration, immutable document
//         const fileName = isFullVersion ? `final-report-full-${caseDoc.caseId}.pdf` : `final-report-citizen-${caseDoc.caseId}.pdf`;
//         res.download(pdfPath, fileName);
//     });




    // these controllers save pdfs in cloudinary
    static guestDownloadReceipt = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { trackingToken } = req.query;

        if (!caseId || !trackingToken) {
            throw new apiError(400, "caseId and trackingToken are required");
        }

        const caseDoc = await Case.findOne({
            _id: caseId,
            trackingToken,
            "reporter.type": "GUEST"
        });

        if (!caseDoc) {
            throw new apiError(404, "Case not found or invalid tracking token");
        }

        let receiptUrl = caseDoc.receiptPdf;

        // Generate PDF if it doesn't exist yet
        if (!receiptUrl) {
            const station = await PoliceStation.findById(caseDoc.policeStationId)
                .populate("stationHead", "fullName email phone badgeNumber");

            const tenant = await Tenant.findById(caseDoc.tenantId);

            receiptUrl = await PDFService.generateReceipt(
                caseDoc,
                station,
                tenant
            );

            await Case.findByIdAndUpdate(caseDoc._id, {
                receiptPdf: receiptUrl,
                guestDownloadAllowed: false
            });
        } else {
            await Case.findByIdAndUpdate(caseDoc._id, {
                guestDownloadAllowed: false
            });
        }

        // Redirect to Cloudinary
        return res.redirect(receiptUrl);
    });



    static downloadReceipt = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        const caseDoc = await Case.findOne({ _id: caseId });

        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        // Citizen can only download their own receipt
        if (
            caseDoc.reporter.type === "CITIZEN" &&
            caseDoc.reporter.citizenId.toString() !== currentUser._id.toString()
        ) {
            throw new apiError(
                403,
                "You can only download your own case receipt"
            );
        }

        let receiptUrl = caseDoc.receiptPdf;

        // Generate only if it doesn't exist
        if (!receiptUrl) {
            const station = await PoliceStation.findById(caseDoc.policeStationId)
                .populate("stationHead", "fullName email phone badgeNumber");

            const tenant = await Tenant.findById(caseDoc.tenantId);

            receiptUrl = await PDFService.generateReceipt(
                caseDoc,
                station,
                tenant
            );

            await Case.findByIdAndUpdate(caseDoc._id, {
                receiptPdf: receiptUrl
            });
        }

        return res.redirect(receiptUrl);
    });



    static downloadFinalReport = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;
        const { version = "citizen" } = req.query;

        const caseDoc = await Case.findOne({ _id: caseId })
            .populate("assignedTo", "fullName email phone badgeNumber");

        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        if (caseDoc.status !== "CLOSED") {
            throw new apiError(
                400,
                "Final report can only be downloaded for closed cases"
            );
        }

        const isFullVersion = version === "full";

        const isReporter =
            caseDoc.reporter.type === "CITIZEN" &&
            caseDoc.reporter.citizenId.toString() === currentUser._id.toString();

        const isAssigned =
            caseDoc.assignedTo &&
            caseDoc.assignedTo.toString() === currentUser._id.toString();

        const isStationHead = currentUser.isStationHead;
        const isAdmin = currentUser.role === "ADMIN";
        const isSuperAdmin = currentUser.isSuperAdmin;

        // Citizen can only download their own report
        if (
            caseDoc.reporter.type === "CITIZEN" &&
            !isReporter &&
            !isStationHead &&
            !isAdmin &&
            !isSuperAdmin
        ) {
            throw new apiError(
                403,
                "You can only download your own case report"
            );
        }

        // Police can only download assigned reports
        if (
            currentUser.role === "POLICE" &&
            !isAssigned &&
            !isStationHead &&
            !isAdmin &&
            !isSuperAdmin
        ) {
            throw new apiError(
                403,
                "You can only download assigned case reports"
            );
        }

        // Full version only for authorized personnel
        if (
            isFullVersion &&
            !isStationHead &&
            !isAdmin &&
            !isSuperAdmin
        ) {
            throw new apiError(
                403,
                "Full version only available to authorized personnel"
            );
        }

        let pdfUrl = isFullVersion
            ? caseDoc.fullPdf
            : caseDoc.citizenPdf;

        // Generate only if PDF doesn't exist
        if (!pdfUrl) {
            const updates = await CaseUpdate.find({
                caseId: caseDoc._id
            })
                .sort({ createdAt: 1 })
                .lean();

            const evidenceCount = await Evidence.countDocuments({
                caseId: caseDoc._id
            });

            pdfUrl = await PDFService.generateFullCase(
                caseDoc,
                updates,
                evidenceCount,
                isFullVersion
            );

            if (isFullVersion) {
                await Case.findByIdAndUpdate(caseDoc._id, {
                    fullPdf: pdfUrl
                });
            } else {
                await Case.findByIdAndUpdate(caseDoc._id, {
                    citizenPdf: pdfUrl
                });
            }
        }

        return res.redirect(pdfUrl);
    });

}

export default PDFController;
