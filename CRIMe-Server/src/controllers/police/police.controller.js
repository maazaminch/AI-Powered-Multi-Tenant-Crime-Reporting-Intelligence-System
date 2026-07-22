import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import Case from "../../models/case.model.js";
import CaseUpdate from "../../models/caseUpdate.model.js";
import NotificationService from "../../services/notification.service.js";
import PoliceStation from "../../models/policeStation.model.js";

class PoliceController {

    // Dashboard Stats
    static dashboardStats = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "POLICE") {
            throw new apiError(403, "Only police officers can access this endpoint");
        }

        const station = await PoliceStation.findById(currentUser.policeStationId);
        const filter = {
            assignedTo: currentUser._id,
            ...req.tenantFilter,
            ...req.stationFilter
        };

        const [
            totalCases,
            assignedCases,
            underInvestigationCases,
            resolvedCases
        ] = await Promise.all([
            Case.countDocuments(filter),
            Case.countDocuments({...filter, status: "ASSIGNED" }),
            Case.countDocuments({ ...filter, status: "UNDER_INVESTIGATION" }),
            Case.countDocuments({ ...filter, status: "RESOLVED" })
        ]);

        const resolutionRate = assignedCases > 0 ? ((resolvedCases / assignedCases) * 100).toFixed(2) : 0;

        res.status(200).json(
            new apiResponse(
                200, 
                {
                    station,
                    totalCases,
                    assignedCases,
                    underInvestigationCases,
                    resolvedCases,
                    resolutionRate
                }, 
                "Dashboard stats fetched successfully")
        );
    });

    // Get My Cases
    static getMyCases = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "POLICE") {
            throw new apiError(403, "Only police officers can access this endpoint");
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
            assignedTo: currentUser._id,
            isArchived: false,
            ...req.tenantFilter,
            ...req.stationFilter
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

        // Search filter (caseId, reporter.name, description)
        if (search) {
            filter.$or = [
                { caseId: { $regex: search, $options: 'i' } },
                { "reporter.name": { $regex: search, $options: 'i' } },
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
            }, "My cases fetched successfully")
        );
    });

    // Add Case Update (Note, Statement, Arrest, Evidence)
    static addCaseUpdate = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { updateType, note, statement, arrest, evidenceFiles } = req.body;
        const currentUser = req.user;

        if (currentUser.role !== "POLICE") {
            throw new apiError(403, "Only police officers can add case updates");
        }

        const validUpdateTypes = ["NOTE", "EVIDENCE", "STATEMENT", "ARREST"];
        if (!validUpdateTypes.includes(updateType)) {
            throw new apiError(400, "Invalid update type");
        }

        const filter = {
            caseId: caseId,
            assignedTo: currentUser._id,
            isArchived: false,
            ...req.tenantFilter,
            ...req.stationFilter
        };

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found or not assigned to you");
        }

        if(caseDoc.status !== "UNDER_INVESTIGATION") {
            throw new apiError(400, `Cannot add updates to a ${caseDoc.status} case`);
        }

        const updateData = {
            tenantId: caseDoc.tenantId,
            caseId: caseDoc._id,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        };

        if (updateType === "NOTE" && note) {
            updateData.note = note;
        }

        if (updateType === "STATEMENT" && statement) {
            updateData.statement = statement;
        }

        if (updateType === "ARREST" && arrest) {
            updateData.arrest = arrest;
        }

        if (updateType === "EVIDENCE" && evidenceFiles) {
            updateData.evidenceFiles = evidenceFiles;
        }

        await Promise.all([
            CaseUpdate.create(updateData),
            updateType === "EVIDENCE" && evidenceFiles?.length
                ? Case.findByIdAndUpdate(caseId, {
                    $push: { evidenceFiles: { $each: evidenceFiles } }
                })
                : Promise.resolve()
        ]);

        res.status(201).json(
            new apiResponse(201, updateData, "Case update added successfully")
        );

        const afterResponse = async () => {
            const tasks = [];

            // Notify station head
            tasks.push(NotificationService.send({
                tenantId: caseDoc.tenantId,
                userId: caseDoc.assignedBy,
                type: "add_case_update",
                title: "Case Update",
                message: `An update has been added to case ${caseDoc.caseId}`,
                channels: ["inapp"]
            }));

            // Notify citizen
            if (caseDoc.reporter.type === 'CITIZEN' && caseDoc.reporter.citizenId) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.reporter.citizenId,
                    type: "add_case_update",
                    title: "Case Update",
                    message: `An update has been added to your case ${caseDoc.caseId}`,
                    channels: ["inapp"]
                }));
            }

            // Notify guest
            if (caseDoc.reporter?.type === 'GUEST' && caseDoc.reporter?.email) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: null,
                    email: caseDoc.reporter.email,
                    type: "add_case_update",
                    title: "Case Update",
                    message: `An update has been added to your case ${caseDoc.caseId}`,
                    channels: ["email"]
                }));
            }

            await Promise.all(tasks);
        };

        afterResponse().catch(err => console.error("Background notification sending failed", err));
    });

    // Update Case Status
    static updateCaseStatus = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { newStatus, remarks } = req.body;
        const currentUser = req.user;

        if (currentUser.role !== "POLICE") {
            throw new apiError(403, "Only police officers can update case status");
        }

        const allowedStatuses = ["UNDER_INVESTIGATION", "RESOLVED"];
        if (!allowedStatuses.includes(newStatus)) {
            throw new apiError(400, "Police can only update status to UNDER_INVESTIGATION or RESOLVED");
        }

        const filter = {
            caseId: caseId,
            assignedTo: currentUser._id,
            isArchived: false,
            ...req.tenantFilter,
            ...req.stationFilter
        };

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found or not assigned to you");
        }

        // Validate status transition
        if (caseDoc.status === "PENDING") {
            throw new apiError(400, "Case must be assigned before updating status");
        }

        if (caseDoc.status === "CLOSED") {
            throw new apiError(400, "Cannot update status of a closed case");
        }

        if (caseDoc.status === newStatus) {
            throw new apiError(400, "Case is already in this status");
        }

        // Only allow ASSIGNED -> UNDER_INVESTIGATION or UNDER_INVESTIGATION -> RESOLVED
        const validTransitions = {
            "ASSIGNED": ["UNDER_INVESTIGATION"],
            "UNDER_INVESTIGATION": ["RESOLVED"]
        };

        if (!validTransitions[caseDoc.status]?.includes(newStatus)) {
            throw new apiError(400, `Invalid status transition from ${caseDoc.status} to ${newStatus}`);
        }

        const updateData = {
            status: newStatus
        };

        const updatedCase = await Case.findOneAndUpdate(
            { caseId: caseId },
            updateData,
            { new: true }
        ).lean();

        if (!updatedCase) {
            throw new apiError(500, "Failed to update case status");
        }

        res.status(200).json(
            new apiResponse(200, updatedCase, "Case status updated successfully")
        );

        const afterResponse = async () => {
            const tasks = [];

            // Create case update
            tasks.push(CaseUpdate.create({
                tenantId: caseDoc.tenantId,
                caseId: caseDoc._id,
                updaterRole: currentUser.role,
                updatedBy: currentUser._id,
                updateType: "STATUS_UPDATE",
                previousStatus: caseDoc.status,
                newStatus: newStatus,
                remarks: remarks || `Status updated to ${newStatus}`,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"]
            }));

            // Notify station head
            tasks.push(NotificationService.send({
                tenantId: caseDoc.tenantId,
                userId: caseDoc.assignedBy,
                type: "case_status_updated",
                title: "Case Status Updated",
                message: `Case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                channels: ["inapp"]
            }));

            // Notify citizen
            if (caseDoc.reporter.type === 'CITIZEN' && caseDoc.reporter.citizenId) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: caseDoc.reporter.citizenId,
                    type: "case_status_updated",
                    title: "Case Status Updated",
                    message: `Your case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                    channels: ["inapp"]
                }));
            }

            // Notify guest
            if (caseDoc.reporter?.type === 'GUEST' && caseDoc.reporter?.email) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: null,
                    email: caseDoc.reporter.email,
                    type: "case_status_updated",
                    title: "Case Status Updated",
                    message: `Your case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                    channels: ["email"]
                }));
            }

            await Promise.all(tasks);
        };

        afterResponse().catch(err => console.error("Error sending notifications", err));
    });

    // Get Case Details
    static getCaseDetails = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "POLICE") {
            throw new apiError(403, "Only police officers can access this endpoint");
        }

        const filter = {
            caseId: caseId,
            assignedTo: currentUser._id,
            isArchived: false,
            ...req.tenantFilter,
            ...req.stationFilter
        };

        const caseDetails = await Case.findOne(filter)
            .populate('assignedTo', 'fullName badgeNumber email phone')
            .populate('reporter.citizenId', 'fullName email phone')
            .populate('policeStationId', 'name address')
            .lean();

        if (!caseDetails) {
            throw new apiError(404, "Case not found or not assigned to you");
        }

        res.status(200).json(
            new apiResponse(200, caseDetails, "Case details fetched successfully")
        );
    });

    // Get Case Updates
    static getCaseUpdates = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "POLICE") {
            throw new apiError(403, "Only police officers can access this endpoint");
        }

        const filter = {
            caseId: caseId,
            assignedTo: currentUser._id,
            isArchived: false,
            ...req.tenantFilter,
            ...req.stationFilter
        };

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found or not assigned to you");
        }

        const updates = await CaseUpdate.find({ caseId: caseDoc._id })
            .populate('updatedBy', 'fullName badgeNumber')
            // .populate('evidenceFiles')
            .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, updates, "Case updates fetched successfully")
        );
    });
}

export default PoliceController;

