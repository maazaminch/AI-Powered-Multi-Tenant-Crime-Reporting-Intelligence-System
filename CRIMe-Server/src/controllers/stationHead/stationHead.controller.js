import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import Case from "../../models/case.model.js";
import CaseAssignmentService from "../../services/caseAssignment.service.js";
import NotificationService from "../../services/notification.service.js";

class StationHeadController {


    //dashboard
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

    // Police Management (Station Level)
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
            activeCases
        };

        res.status(200).json(
            new apiResponse(200, policeDetails, "Police details fetched successfully")
        );
    });

    static assignCaseToPolice = wrapAsync(async (req, res) => {
        const { caseId, policeId } = req.body;
        const currentUser = req.user;

        const result = await CaseAssignmentService.assignCaseToPolice(caseId, policeId, currentUser);

        res.status(200).json(
            new apiResponse(200, result, "Case assigned to police successfully")
        );
    });

    static reassignCase = wrapAsync(async (req, res) => {
        const { caseId, newPoliceId } = req.body;
        const currentUser = req.user;

        const result = await CaseAssignmentService.reassignCase(caseId, newPoliceId, currentUser);

        res.status(200).json(
            new apiResponse(200, result, "Case reassigned successfully")
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
    static getStationCases = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const { status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const filter = {
            policeStationId: currentUser.policeStationId
        };

        if (status) {
            filter.status = status;
        }

        const cases = await Case.find(filter)
            .populate('assignedTo', 'fullName badgeNumber')
            .populate('citizenId', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalCases = await Case.countDocuments(filter);

        res.status(200).json(
            new apiResponse(200, {
                cases,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCases / limit),
                    totalCases,
                    hasNext: page * limit < totalCases
                }
            }, "Station cases fetched successfully")
        );
    });

    static getPendingCases = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const pendingCases = await Case.find({
            policeStationId: currentUser.policeStationId,
            status: "ASSIGNED_TO_POLICE_STATION"
        })
            .populate('citizenId', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, pendingCases, "Pending cases fetched successfully")
        );
    });


    static getCaseDetails = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const caseDetails = await Case.findById(caseId)
            .populate('assignedTo', 'fullName badgeNumber email')
            .populate('citizenId', 'fullName email phone')
            .populate('policeStationId', 'stationName address');

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
        const CaseUpdate = (await import("../../models/caseUpdate.model.js")).default;
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
}

export default StationHeadController;
