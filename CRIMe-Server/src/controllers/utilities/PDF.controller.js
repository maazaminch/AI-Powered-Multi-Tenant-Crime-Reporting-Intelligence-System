
// controllers/caseFile.controller.js
import fs from "fs";
import apiError from "../utils/apiError.js";
import CrimeReport from "../models/CrimeReport.js";
import PDFService from "../services/PDFService.js";

class CaseFileController {

    /**
     * Download or view PDF (receipt or full case)
     * type = 'receipt' | 'full'
     */
    static downloadPDF = async (req, res) => {
        const { caseId } = req.params;
        const { type } = req.query; // e.g., ?type=receipt or ?type=full
        const currentUser = req.user;

        if (!["receipt", "full"].includes(type)) {
            throw new apiError(400, "Invalid PDF type");
        }

        const crimeReport = await CrimeReport.findById(caseId);
        if (!crimeReport) throw new apiError(404, "Case not found");

        // Permissions
        const isOwner = crimeReport.citizenId.toString() === currentUser._id.toString();
        const isAssignedPolice = crimeReport.assignedPoliceId?.toString() === currentUser._id.toString();
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(currentUser.role);

        if (!isOwner && !isAssignedPolice && !isAdmin) {
            throw new apiError(403, "Access denied");
        }

        // Full case PDF can only be generated for CLOSED cases
        if (type === "full" && crimeReport.status !== "CLOSED") {
            throw new apiError(400, "Full case PDF is not available until case is CLOSED");
        }

        // Generate file path using PDFService (same as when created)
        const filePath = PDFService.generateFilePath(caseId, type);

        // If file does not exist, generate it
        if (!fs.existsSync(filePath)) {
            if (type === "receipt") {
                await PDFService.generateReceipt({
                    caseId: crimeReport._id,
                    crimeType: crimeReport.crimeType,
                    severity: crimeReport.severity,
                    createdAt: crimeReport.createdAt,
                    description: crimeReport.description
                });
            } else if (type === "full") {
                await PDFService.generateFullCase({
                    caseId: crimeReport._id,
                    crimeType: crimeReport.crimeType,
                    severity: crimeReport.severity,
                    status: crimeReport.status,
                    reporterName: crimeReport.reporterName,
                    createdAt: crimeReport.createdAt,
                    description: crimeReport.description,
                    aiSummary: crimeReport.aiSummary,
                    resolutionDetails: crimeReport.resolutionDetails,
                    location: crimeReport.location
                });
            }
        }

        // Stream PDF to browser
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="case-${caseId}-${type}.pdf"`);



        //Later we can change this line for s3 or cloudinary
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    };
}

export default CaseFileController;