import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import Case from "../../models/case.model.js";
import CaseUpdate from "../../models/caseUpdate.model.js";
import NotificationService from "../../services/notification.service.js";

class CitizenController {

    // POST /citizen/citizen-report-crime - Submit crime report as authenticated citizen
    static reportCrime = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        const { 
            crimeType, 
            description, 
            location, 
            addressText, 
            evidenceFiles 
        } = req.body;

        if (!crimeType || !description || !location || !location.coordinates) {
            throw new apiError(400, "Missing required fields: crimeType, description, location");
        }

        const caseData = {
            tenantId: currentUser.tenantId,
            reporter: {
                type: "CITIZEN",
                citizenId: currentUser._id,
                name: currentUser.fullName,
                email: currentUser.email,
                phone: currentUser.phone
            },
            crimeType,
            description,
            location,
            addressText,
            evidenceFiles: evidenceFiles || []
        };

        const newCase = await Case.create(caseData);

        res.status(201).json(
            new apiResponse(201, newCase, "Crime reported successfully")
        );

        const afterResponse = async () => {
            // Notify admin/station head about new case
            await NotificationService.send({
                tenantId: newCase.tenantId,
                userId: null,
                type: "new_case_reported",
                title: "New Crime Reported",
                message: `New crime case ${newCase.caseId} has been reported by citizen ${currentUser.fullName}`,
                channels: ["inapp"]
            });
        };

        afterResponse().catch(err => console.error("Background notification sending failed", err));
    });

    // GET /citizen/my-reports - Get all reports by logged-in citizen
    static getMyReports = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        const { 
            status, 
            crimeType,
            severity, 
            search, 
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        
        const filter = {
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false,
            ...req.tenantFilter
        };

        // Status filter
        if (status) {
            filter.status = status;
        }

        // Crime type filter
        if (crimeType) {
            filter.crimeType = crimeType;
        }

        // Severity filter
        if (severity) {
            filter.severity = severity;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Search filter (caseId, crimeType, description)
        if (search) {
            filter.$or = [
                { caseId: { $regex: search, $options: 'i' } },
                { crimeType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [cases, totalCases] = await Promise.all([
            Case.find(filter)
                .populate('assignedTo', 'fullName badgeNumber')
                .populate('assignedBy', 'fullName')
                .populate('policeStationId', 'name address')
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Case.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCases / parseInt(limit));

        res.status(200).json(
            new apiResponse(200, {
                cases,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalCases,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, "My reports fetched successfully")
        );
    });

    // GET /citizen/case/:id - Get case details with visibility filtering
    static getCaseDetails = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        const filter = {
            caseId: caseId,
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false,
            ...req.tenantFilter
        };

        const caseDetails = await Case.findOne(filter)
            .populate('assignedTo', 'fullName badgeNumber email phone')
            .populate('assignedBy', 'fullName')
            .populate('policeStationId', 'name address')
            .lean();

        if (!caseDetails) {
            throw new apiError(404, "Case not found or you don't have access to this case");
        }

        // Get updates with visibility filtering
        // Citizens can only see: 
        // 1. Their own updates (updaterRole === "CITIZEN")
        // 2. PUBLIC updates (visibility === "PUBLIC")
        const updates = await CaseUpdate.find({ 
            caseId: caseDetails._id,
            $or: [
                { updaterRole: "CITIZEN" },
                { visibility: "PUBLIC" }
            ]
        })
        .populate('updatedBy', 'fullName badgeNumber')
        .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, { 
                caseDetails, 
                updates 
            }, "Case details fetched successfully")
        );
    });

    // POST /citizen/case/:id/add-information - Add notes/information to case
    static addInformation = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { note } = req.body;
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        if (!note) {
            throw new apiError(400, "Note is required");
        }

        const filter = {
            caseId: caseId,
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false,
            ...req.tenantFilter
        };

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found or you don't have access to this case");
        }

        // Check if case is under investigation
        if (caseDoc.status !== "UNDER_INVESTIGATION") {
            throw new apiError(403, `Cannot add information to a ${caseDoc.status} case. Updates only allowed during UNDER_INVESTIGATION`);
        }

        // Check if citizen updates are allowed
        if (!caseDoc.allowCitizenUpdates) {
            throw new apiError(403, "Investigating officer has disabled public updates for this case");
        }

        const updateData = {
            tenantId: caseDoc.tenantId,
            caseId: caseDoc._id,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "NOTE",
            note,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        };

        const newUpdate = await CaseUpdate.create(updateData);

        res.status(201).json(
            new apiResponse(201, newUpdate, "Information added successfully")
        );

        const afterResponse = async () => {
            const tasks = [];

            // Notify assigned officer
            if (caseDoc.assignedTo) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.assignedTo,
                    type: "citizen_added_information",
                    title: "New Information Added",
                    message: `Citizen has added information to case ${caseDoc.caseId}`,
                    channels: ["inapp"]
                }));
            }

            // Notify station head
            if (caseDoc.assignedBy) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.assignedBy,
                    type: "citizen_added_information",
                    title: "New Information Added",
                    message: `Citizen has added information to case ${caseDoc.caseId}`,
                    channels: ["inapp"]
                }));
            }

            await Promise.all(tasks);
        };

        afterResponse().catch(err => console.error("Background notification sending failed", err));
    });

    // POST /citizen/case/:id/upload-evidence - Upload evidence files
    static uploadEvidence = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { evidenceFiles } = req.body;
        const currentUser = req.user;

        if (currentUser.role !== "CITIZEN") {
            throw new apiError(403, "Only citizens can access this endpoint");
        }

        if (!evidenceFiles || evidenceFiles.length === 0) {
            throw new apiError(400, "Evidence files are required");
        }

        const filter = {
            caseId: caseId,
            "reporter.type": "CITIZEN",
            "reporter.citizenId": currentUser._id,
            isArchived: false,
            ...req.tenantFilter
        };

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found or you don't have access to this case");
        }

        // Check if case is under investigation
        if (caseDoc.status !== "UNDER_INVESTIGATION") {
            throw new apiError(403, `Cannot upload evidence to a ${caseDoc.status} case. Updates only allowed during UNDER_INVESTIGATION`);
        }

        // Check if citizen updates are allowed
        if (!caseDoc.allowCitizenUpdates) {
            throw new apiError(403, "Investigating officer has disabled public updates for this case");
        }

        const updateData = {
            tenantId: caseDoc.tenantId,
            caseId: caseDoc._id,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "EVIDENCE",
            evidenceFiles,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        };

        await Promise.all([
            CaseUpdate.create(updateData),
            Case.findByIdAndUpdate(caseDoc._id, {
                $push: { evidenceFiles: { $each: evidenceFiles } }
            })
        ]);

        res.status(201).json(
            new apiResponse(201, updateData, "Evidence uploaded successfully")
        );

        const afterResponse = async () => {
            const tasks = [];

            // Notify assigned officer
            if (caseDoc.assignedTo) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.assignedTo,
                    type: "citizen_uploaded_evidence",
                    title: "New Evidence Uploaded",
                    message: `Citizen has uploaded evidence to case ${caseDoc.caseId}`,
                    channels: ["inapp"]
                }));
            }

            // Notify station head
            if (caseDoc.assignedBy) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.assignedBy,
                    type: "citizen_uploaded_evidence",
                    title: "New Evidence Uploaded",
                    message: `Citizen has uploaded evidence to case ${caseDoc.caseId}`,
                    channels: ["inapp"]
                }));
            }

            await Promise.all(tasks);
        };

        afterResponse().catch(err => console.error("Background notification sending failed", err));
    });
}

export default CitizenController;
