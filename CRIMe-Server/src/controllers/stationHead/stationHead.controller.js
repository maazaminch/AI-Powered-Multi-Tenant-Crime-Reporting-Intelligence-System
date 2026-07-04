import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import Case from "../../models/case.model.js";
import CaseUpdate from "../../models/caseUpdate.model.js";
import NotificationService from "../../services/notification.service.js";

class StationHeadController {


    // Dashboard
    static dashboardStats = wrapAsync(async (req, res) => {

        const filter = {
            ...req.tenantFilter,
            ...req.stationFilter
        }

        const station = await PoliceStation.findById(req.user.policeStationId);
        const [
            stationPolice,
            totalCases,
            pendingCases,
            underInvestigationCases,
            resolvedCases
        ] = await Promise.all([
            User.countDocuments({
                ...filter,
                role: "POLICE",
                status: "APPROVED",
            }),
            Case.countDocuments({
                ...filter
            }),
            Case.countDocuments({
                ...filter,
                status: "PENDING"
            }),
            Case.countDocuments({
                ...filter,
                status: "UNDER_INVESTIGATION"
            }),
            Case.countDocuments({
                ...filter,
                status: "RESOLVED"
            })
        ])
        
        res.status(200).json(
            new apiResponse(200, {
                policeStation: station,
                stationPolice,
                totalCases,
                pendingCases,
                underInvestigationCases,
                resolvedCases
            }, 
            "Dashboard stats fetched successfully")
        );
    })

    // Station Police
    static getStationPolice = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const stationPolice = await User.find({
            role: "POLICE",
            status: "APPROVED",
            policeStationId: currentUser.policeStationId,
            isStationHead: false
        })
            .select('fullName email phone badgeNumber createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPolice = await User.countDocuments({
            role: "POLICE",
            status: "APPROVED",
            policeStationId: currentUser.policeStationId,
            isStationHead: false
        });

        // Get stats for each officer
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const policeWithStats = await Promise.all(
            stationPolice.map(async (police) => {
                const [
                    activeCasesCount,
                    resolvedThisMonth,
                    allResolvedCases
                ] = await Promise.all([
                    Case.countDocuments({
                        assignedTo: police._id,
                        status: { $in: ["ASSIGNED", "UNDER_INVESTIGATION"] }
                    }),
                    Case.countDocuments({
                        assignedTo: police._id,
                        status: "RESOLVED",
                        resolvedAt: { $gte: currentMonthStart }
                    }),
                    Case.find({
                        assignedTo: police._id,
                        status: "RESOLVED",
                        resolvedAt: { $exists: true }
                    }).select('resolvedAt createdAt')
                ]);

                // Calculate average resolution time in days
                let avgResolutionTime = 0;
                if (allResolvedCases.length > 0) {
                    const totalResolutionTime = allResolvedCases.reduce((sum, caseDoc) => {
                        const resolutionDays = (caseDoc.resolvedAt - caseDoc.createdAt) / (1000 * 60 * 60 * 24);
                        return sum + resolutionDays;
                    }, 0);
                    avgResolutionTime = (totalResolutionTime / allResolvedCases.length).toFixed(1);
                }

                return {
                    ...police,
                    activeCasesCount,
                    resolvedThisMonth,
                    avgResolutionTime: parseFloat(avgResolutionTime),
                    onDutyStatus: "ON_DUTY" // Placeholder - implement real-time tracking if needed
                };
            })
        );

        const totalPages = Math.ceil(totalPolice / limit);

        res.status(200).json(
            new apiResponse(200, {
                police: policeWithStats,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPolice,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, "Station police fetched successfully")
        );
    });

    static getPoliceDetails = wrapAsync(async (req, res) => {
        const { policeId } = req.params;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        // Validate police belongs to same station
        const police = await User.findOne({
            _id: policeId,
            role: "POLICE",
            policeStationId: currentUser.policeStationId
        }).select('-password');

        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        // Get all-time stats
        const [
            totalAssigned,
            totalResolved,
            totalClosed,
            activeCases
        ] = await Promise.all([
            Case.countDocuments({
                assignedTo: policeId,
                policeStationId: currentUser.policeStationId
            }),
            Case.countDocuments({
                assignedTo: policeId,
                policeStationId: currentUser.policeStationId,
                status: "RESOLVED"
            }),
            Case.countDocuments({
                assignedTo: policeId,
                policeStationId: currentUser.policeStationId,
                status: "CLOSED"
            }),
            Case.find({
                assignedTo: policeId,
                policeStationId: currentUser.policeStationId,
                status: { $in: ["ASSIGNED", "UNDER_INVESTIGATION"] }
            })
            .select('caseId status crimeType createdAt')
            .sort({ createdAt: -1 })
            .lean()
        ]);

        const policeDetails = {
            officer: {
                _id: police._id,
                fullName: police.fullName,
                badgeNumber: police.badgeNumber,
                email: police.email,
                phone: police.phone,
                joinDate: police.createdAt,
                profilePictureUrl: police.profilePictureUrl
            },
            allTimeStats: {
                totalAssigned,
                totalResolved,
                totalClosed
            },
            activeCases: activeCases.map(caseItem => ({
                ...caseItem,
                createdAt: caseItem.createdAt.toISOString()
            }))
        };

        res.status(200).json(
            new apiResponse(200, policeDetails, "Police details fetched successfully")
        );
    });


    // Station Cases
    static getStationCases = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const { 
            status, 
            page = 1, 
            limit = 10,
            search,
            crimeType,
            severity,
            assignedTo,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        const skip = (page - 1) * limit;

        const filter = {
            policeStationId: currentUser.policeStationId
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

        // Assigned filter
        if (assignedTo) {
            if (assignedTo === 'UNASSIGNED') {
                filter.assignedTo = { $exists: false };
            } else {
                filter.assignedTo = assignedTo;
            }
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
                { 'reporter.name': { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sortObj = {};
        const validSortFields = ['createdAt', 'severity', 'status', 'caseId', 'crimeType'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

        const cases = await Case.find(filter)
            .select('caseId crimeType severity status createdAt assignedTo reporter description addressText')
            .populate('assignedTo', 'fullName badgeNumber')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Truncate description for list view
        const casesWithPreview = cases.map(caseItem => ({
            ...caseItem,
            description: caseItem.description ? caseItem.description.substring(0, 100) + (caseItem.description.length > 100 ? '...' : '') : ''
        }));

        const totalCases = await Case.countDocuments(filter);

        res.status(200).json(
            new apiResponse(200, {
                cases: casesWithPreview,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCases / limit),
                    totalCases,
                    hasNext: page * limit < totalCases,
                    hasPrevPage: page > 1
                }
            }, "Station cases fetched successfully")
        );
    });

    // Case Details
    static getCaseDetails = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const caseDetails = await Case.findById(caseId)
            .populate('assignedTo', 'fullName badgeNumber email')
            .populate('reporter.citizenId', 'fullName email phone')
            .populate('policeStationId', 'name address')
            .populate('evidenceFiles')
            .lean();

        if (!caseDetails) {
            throw new apiError(404, "Case not found");
        }

        // Station isolation
        if (caseDetails.policeStationId._id.toString() !== currentUser.policeStationId?.toString()) {
            throw new apiError(403, "Access denied");
        }

        res.status(200).json(
            new apiResponse(200, caseDetails, "Case details fetched successfully")
        );
    });

    static updateCaseStatus = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { newStatus, remarks } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const validStatuses = ["ASSIGNED_TO_POLICE_STATION", "UNDER_INVESTIGATION", "RESOLVED", "CLOSED"];
        if (!validStatuses.includes(newStatus)) {
            throw new apiError(400, "Invalid status");
        }

        const caseDoc = await Case.findById(caseId);
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        // Station isolation
        if (caseDoc.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
            throw new apiError(403, "Access denied");
        }

        const previousStatus = caseDoc.status;
        caseDoc.status = newStatus;
        await caseDoc.save();

        // Create case update
        await CaseUpdate.create({
            tenantId: caseDoc.tenantId,
            caseId: caseDoc._id,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus,
            newStatus,
            remarks: remarks || `Status updated by Station Head: ${currentUser.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

        // Notify assigned police if case is being updated
        if (caseDoc.assignedTo && caseDoc.assignedTo.toString() !== currentUser._id.toString()) {
            await NotificationService.send({
                tenantId: caseDoc.tenantId,
                userId: caseDoc.assignedTo,
                type: "case_status_updated",
                title: "Case Status Updated",
                message: `Case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                channels: ["inapp"]
            });
        }

        res.status(200).json(
            new apiResponse(200, caseDoc, "Case status updated successfully")
        );
    });

    static addCaseUpdate = wrapAsync(async (req, res) => {
        const { caseId, updateType, remarks, note, statement, arrest, evidenceFiles } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const validUpdateTypes = ["NOTE", "EVIDENCE", "STATEMENT", "ARREST"];
        if (!validUpdateTypes.includes(updateType)) {
            throw new apiError(400, "Invalid update type");
        }

        const caseDoc = await Case.findById(caseId);
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        // Station isolation
        if (caseDoc.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
            throw new apiError(403, "Access denied");
        }


        const updateData = {
            tenantId: caseDoc.tenantId,
            caseId: caseDoc._id,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType,
            remarks,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        };

        // Add type-specific fields
        if (updateType === "NOTE" && note) {
            updateData.note = note;
        } else if (updateType === "STATEMENT" && statement) {
            updateData.statement = statement;
        } else if (updateType === "ARREST" && arrest) {
            updateData.arrest = arrest;
        } else if (updateType === "EVIDENCE" && evidenceFiles) {
            updateData.evidenceFiles = evidenceFiles;
        }

        const caseUpdate = await CaseUpdate.create(updateData);

        // If adding evidence, update case document
        if (updateType === "EVIDENCE" && evidenceFiles) {
            caseDoc.evidenceFiles.push(...evidenceFiles);
            await caseDoc.save();
        }

        res.status(201).json(
            new apiResponse(201, caseUpdate, "Case update added successfully")
        );
    });

    static getCaseUpdates = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const caseDoc = await Case.findById(caseId);
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        // Station isolation
        if (caseDoc.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
            throw new apiError(403, "Access denied");
        }


        const updates = await CaseUpdate.find({ caseId: caseDoc._id })
            .populate('updatedBy', 'fullName badgeNumber')
            .populate('evidenceFiles')
            .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, updates, "Case updates fetched successfully")
        );
    });

    static assignCaseToPolice = wrapAsync(async (req, res) => {
        const { caseId, policeId } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can assign cases to police");
        }

        // Validate case exists
        const caseData = await Case.findById(caseId);
        if (!caseData) {
            throw new apiError(404, "Case not found");
        }

        // Validate police exists
        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        if (police.role !== "POLICE") {
            throw new apiError(400, "Case can only be assigned to police officers");
        }

        // Police must belong to the same station as the case
        if (caseData.policeStationId?.toString() !== police.policeStationId?.toString()) {
            throw new apiError(400, "Police officer must belong to the same station as the case");
        }

        // Station head must belong to the same station
        if (currentUser.policeStationId?.toString() !== caseData.policeStationId?.toString()) {
            throw new apiError(403, "You can only assign cases from your own station");
        }

        // Only allow assignment if case is ASSIGNED_TO_POLICE_STATION
        if (caseData.status !== "ASSIGNED_TO_POLICE_STATION") {
            throw new apiError(400, "Case must be assigned to station before assigning to police");
        }

        // Don't assign if already assigned to this police
        if (caseData.assignedTo?.toString() === policeId) {
            throw new apiError(400, "Case is already assigned to this police officer");
        }

        // Update case assignment
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            {
                assignedTo: policeId,
                assignedBy: currentUser._id,
                status: "UNDER_INVESTIGATION"
            },
            { new: true }
        ).populate([
            { path: 'assignedTo', select: 'fullName email badgeNumber' },
            { path: 'policeStationId', select: 'stationName' }
        ]);

        // Create case update
        await CaseUpdate.create({
            tenantId: caseData.tenantId,
            caseId: caseId,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus: "ASSIGNED_TO_POLICE_STATION",
            newStatus: "UNDER_INVESTIGATION",
            remarks: `Case assigned to Police Officer ${police.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

        // Notify assigned police
        await NotificationService.send({
            tenantId: caseData.tenantId,
            userId: policeId,
            type: "case_assigned_to_police",
            title: "Case Assigned for Investigation",
            message: `You have been assigned to investigate case ${updatedCase.caseId}`,
            channels: ["inapp", "email"]
        });

        // Notify citizen (if CITIZEN type)
        if (caseData.reporter?.type === "CITIZEN" && caseData.reporter?.citizenId) {
            await NotificationService.send({
                tenantId: caseData.tenantId,
                userId: caseData.reporter.citizenId,
                type: "case_investigation_started",
                title: "Investigation Started",
                message: `Your case ${updatedCase.caseId} is now under investigation`,
                channels: ["inapp", "email"]
            });
        }

        res.status(200).json(
            new apiResponse(200, updatedCase, "Case assigned to police successfully")
        );
    });

    static reassignCase = wrapAsync(async (req, res) => {
        const { caseId, newPoliceId } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can reassign cases");
        }

        // Validate case exists
        const caseData = await Case.findById(caseId);
        if (!caseData) {
            throw new apiError(404, "Case not found");
        }

        // Validate new police
        const newPolice = await User.findById(newPoliceId);
        if (!newPolice) {
            throw new apiError(404, "Police officer not found");
        }

        if (newPolice.role !== "POLICE") {
            throw new apiError(400, "Case can only be assigned to police officers");
        }

        // Must be from same station
        if (currentUser.policeStationId?.toString() !== caseData.policeStationId?.toString()) {
            throw new apiError(403, "You can only reassign cases from your own station");
        }

        if (newPolice.policeStationId?.toString() !== caseData.policeStationId?.toString()) {
            throw new apiError(400, "New police officer must belong to the same station");
        }

        // Only allow reassignment if case is UNDER_INVESTIGATION
        if (caseData.status !== "UNDER_INVESTIGATION") {
            throw new apiError(400, "Only cases under investigation can be reassigned");
        }

        const previousPoliceId = caseData.assignedTo;

        // Update case assignment
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            {
                assignedTo: newPoliceId,
                assignedBy: currentUser._id
            },
            { new: true }
        ).populate([
            { path: 'assignedTo', select: 'fullName email badgeNumber' },
            { path: 'policeStationId', select: 'stationName' }
        ]);

        // Create case update
        await CaseUpdate.create({
            tenantId: caseData.tenantId,
            caseId: caseId,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus: "UNDER_INVESTIGATION",
            newStatus: "UNDER_INVESTIGATION",
            remarks: `Case reassigned from previous officer to ${newPolice.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

        // Notify new police
        await NotificationService.send({
            tenantId: caseData.tenantId,
            userId: newPoliceId,
            type: "case_reassigned",
            title: "Case Reassigned",
            message: `Case ${updatedCase.caseId} has been reassigned to you`,
            channels: ["inapp", "email"]
        });

        // Notify previous police (if exists and different)
        if (previousPoliceId && previousPoliceId.toString() !== newPoliceId) {
            await NotificationService.send({
                tenantId: caseData.tenantId,
                userId: previousPoliceId,
                type: "case_reassignment_removed",
                title: "Case Reassignment",
                message: `Case ${updatedCase.caseId} has been reassigned to another officer`,
                channels: ["inapp"]
            });
        }

        res.status(200).json(
            new apiResponse(200, updatedCase, "Case reassigned successfully")
        );
    });




    
    static getPolicePerformance = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const policeId = req.params.policeId;

        // Validate police belongs to same station
        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        if (police.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
            throw new apiError(403, "Police officer is not in your station");
        }

        // Get performance metrics
        const [
            totalCases,
            resolvedCases,
            pendingCases,
            underInvestigationCases
        ] = await Promise.all([
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                assignedTo: policeId
            }),
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                assignedTo: policeId,
                status: "RESOLVED"
            }),
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                assignedTo: policeId,
                status: "PENDING"
            }),
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                assignedTo: policeId,
                status: "UNDER_INVESTIGATION"
            })
        ]);

        const performance = {
            policeId: police._id,
            policeName: police.fullName,
            badgeNumber: police.badgeNumber,
            totalCases,
            resolvedCases,
            pendingCases,
            underInvestigationCases,
            resolutionRate: totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(2) : 0
        };

        res.status(200).json(
            new apiResponse(200, performance, "Police performance fetched successfully")
        );
    });

    // Case Management (Station Level)





    // Station Operations
    static getStationDetails = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const station = await PoliceStation.findById(currentUser.policeStationId)
            .populate('stationHead', 'fullName email badgeNumber')
            .populate('tenantId', 'name code region');

        if (!station) {
            throw new apiError(404, "Station not found");
        }

        res.status(200).json(
            new apiResponse(200, station, "Station details fetched successfully")
        );
    });

    static getStationAnalytics = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const [
            totalCases,
            pendingCases,
            underInvestigationCases,
            resolvedCases,
            totalPolice,
            activePolice,
            avgResolutionTime
        ] = await Promise.all([
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                ...dateFilter
            }),
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                status: "ASSIGNED_TO_POLICE_STATION",
                ...dateFilter
            }),
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                status: "UNDER_INVESTIGATION",
                ...dateFilter
            }),
            Case.countDocuments({
                policeStationId: currentUser.policeStationId,
                status: "RESOLVED",
                ...dateFilter
            }),
            User.countDocuments({
                role: "POLICE",
                status: "APPROVED",
                policeStationId: currentUser.policeStationId
            }),
            User.countDocuments({
                role: "POLICE",
                status: "APPROVED",
                policeStationId: currentUser.policeStationId,
                isStationHead: false
            }),
            // Average resolution time calculation
            Case.aggregate([
                {
                    $match: {
                        policeStationId: currentUser.policeStationId,
                        status: "RESOLVED",
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgResolutionTime: {
                            $avg: {
                                $subtract: ["$updatedAt", "$createdAt"]
                            }
                        }
                    }
                }
            ])
        ]);

        const analytics = {
            totalCases,
            pendingCases,
            underInvestigationCases,
            resolvedCases,
            totalPolice,
            activePolice,
            avgResolutionTime: avgResolutionTime[0]?.avgResolutionTime || 0,
            resolutionRate: totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(2) : 0
        };

        res.status(200).json(
            new apiResponse(200, analytics, "Station analytics fetched successfully")
        );
    });




}

export default StationHeadController;
