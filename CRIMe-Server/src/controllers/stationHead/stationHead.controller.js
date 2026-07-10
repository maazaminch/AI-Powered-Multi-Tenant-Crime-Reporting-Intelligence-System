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
                isStationHead: false
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

        const filter = {
            role: "POLICE",
            status: "APPROVED",
            isStationHead: false,
            ...req.tenantFilter,
            ...req.stationFilter
        }
        const stationPolice = await User.find(filter)
            .select('fullName email phone badgeNumber createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPolice = await User.countDocuments(filter);

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

        const policeFilter = {
            _id: policeId,
            role: "POLICE",
            ...req.tenantFilter,
            ...req.stationFilter
        }
        
        const caseFilter = {
            assignedTo: policeId,
            ...req.tenantFilter,
            ...req.stationFilter
        };
        // Validate police belongs to same station
        const police = await User.findOne(policeFilter)
        .select('-password')
        .lean();

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
                ...caseFilter,
            }),
            Case.countDocuments({
                ...caseFilter,
                status: "RESOLVED"
            }),
            Case.countDocuments({
                ...caseFilter,
                status: "CLOSED"
            }),
            Case.countDocuments({
                ...caseFilter,
                status: "RESOLVED"
            }),
            Case.countDocuments({
                ...caseFilter,
                status: "CLOSED"
            }),
            Case.find({
                ...caseFilter,
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
            activeCases
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

        const filter = {
            _id: caseId,
            ...req.tenantFilter,
            ...req.stationFilter
        }

        const caseDetails = await Case.findById(filter)
            .populate('assignedTo', 'fullName badgeNumber email')
            .populate('reporter.citizenId', 'fullName email phone')
            .populate('policeStationId', 'name address')
            .populate('evidenceFiles')
            .lean();

        if (!caseDetails) {
            throw new apiError(404, "Case not found");
        }

        res.status(200).json(
            new apiResponse(200, caseDetails, "Case details fetched successfully")
        );
    });
    //sho can only close the case
    static closeCaseStatus = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { remarks } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }
        const newStatus = "CLOSED";

        const validStatuses = ["CLOSED"];
        if (!validStatuses.includes(newStatus)) {
            throw new apiError(400, "Invalid status");
        }
        

        const filter = {
            _id: caseId,
            ...req.tenantFilter,
            ...req.stationFilter,
            isArchived: false 
        }

        const caseDoc = await Case.findOne(filter);
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        if (caseDoc.status !== "RESOLVED") {
            throw new apiError(400, "Case is not resolved");
        }
        if(caseDoc.isArchived) {
            throw new apiError(400, "Case is already archived");
        }
        if(caseDoc.status === "CLOSED") {
            throw new apiError(400, "Case is already closed");
        }

        const updatedCase = await Case.findByIdAndUpdate(
            { _id: caseId, status: "RESOLVED" },
            { status: newStatus },
            { new: true }
        ).lean();
        if (!updatedCase) {
            throw new apiError(409, "Case was modified by another request. Please retry.");
        }

        // Create case update
        await CaseUpdate.create({
            tenantId: caseDoc.tenantId,
            caseId: caseDoc._id,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus: "RESOLVED",
            newStatus,
            remarks: remarks || `Status updated by Station Head: ${currentUser.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

        // Notify assigned police if case is being updated
        if (caseDoc.assignedTo) {
            await NotificationService.send({
                tenantId: caseDoc.tenantId,
                userId: caseDoc.assignedTo,
                type: "case_status_updated",
                title: "Case Status Updated",
                message: `Case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                channels: ["inapp"]
            });
        }

        if (caseDoc.reporter.type === "CITIZEN") {
            // Notify citizen
            await NotificationService.send({
                tenantId: caseDoc.tenantId,
                userId: caseDoc.reporter.citizenId,
                type: "case_status_updated",
                title: "Case Status Updated",
                message: `Case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                channels: ["inapp"]
            });
        } else {
            // Notify guest
            await NotificationService.send({
                tenantId: caseDoc.tenantId,
                userId: null,
                email: caseDoc.reporter.email,
                type: "case_status_updated",
                title: "Case Status Updated",
                message: `Case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                channels: ["email"]
            });
        }


        const admins = await User.find({ tenantId: currentUser.tenantId, role: "ADMIN" });
        const adminNotificationPromises = admins.map(admin => 
            NotificationService.send({
                tenantId: currentUser.tenantId,
                userId: admin._id,
                type: "case_status_updated",
                title: "Case Status Updated",
                message: `Case ${caseDoc.caseId} status has been updated to ${newStatus}`,
                channels: ["inapp"]
            })
        )
        await Promise.all(adminNotificationPromises);

        res.status(200).json(
            new apiResponse(200, updatedCase, "Case status updated successfully")
        );
    });

    static addCaseUpdate = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { updateType, remarks, note, statement, arrest, evidenceFiles } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const blockUpdateStatuses = ['PENDING', 'CLOSED']
        if (blockUpdateStatuses.includes(caseDoc.status)) {
            throw new apiError(400, `Cannot add updates to a ${caseDoc.status} case`);
        }

        const validUpdateTypes = ["NOTE", "EVIDENCE", "STATEMENT", "ARREST"];
        if (!validUpdateTypes.includes(updateType)) {
            throw new apiError(400, "Invalid update type");
        }

        const filter = {
            _id: caseId,
            isArchived: false,
            ...req.tenantFilter,
            ...req.stationFilter
        }

        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
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

        await Promise.all([
            CaseUpdate.create(updateData),
            updateType === "EVIDENCE" && evidenceFiles?.length
                ? Case.findByIdAndUpdate(caseId, {
                    $push: { evidenceFiles: { $each: evidenceFiles } }
                })
                : Promise.resolve()
            ]);

        res.status(201).json(
            new apiResponse(201, caseUpdate, "Case update added successfully")
        );

        const afterResponse = async () => {
            
            const tasks = []

            const assignedPolice = caseDoc.assignedTo;
            tasks.push(NotificationService.send({
                tenantId: caseDoc.tenantId,
                userId: assignedPolice,
                type: "add_case_update",
                title: "Case Update",
                message: `A new update has been added to case ${caseDoc.caseId}`,
                channels: ["inapp"]
            }))

            if(caseDoc.reporter.type === 'CITIZEN' && caseDoc.reporter.citizenId) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: assignedPolice,
                    type: "add_case_update",
                    title: "Case Update",
                    message: `A new update has been added to case ${caseDoc.caseId}`,
                    channels: ["inapp"]

                }))
            }

            if(caseDoc.reporter?.type === 'GUEST' && caseDoc.reporter?.email) {
                tasks.push(NotificationService.send({
                    tenantId: caseDoc.tenantId,
                    userId: null,
                    email: caseDoc.reporter.email,
                    type: "add_case_update",
                    title: "Case Update",
                    message: `A new update has been added to case ${caseDoc.caseId}`,
                    channels: ["email"]

                }))
            }

            await Promise.all(tasks)
        }

        afterResponse().catch(err => logger.error("Error sending notifications", err));
        
    });

    static getCaseUpdates = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can access this endpoint");
        }

        const filter = {
            _id: caseId,
            ...req.tenantFilter,
            ...req.stationFilter
        }
        const caseDoc = await Case.findOne(filter).lean();
        if (!caseDoc) {
            throw new apiError(404, "Case not found");
        }

        const updates = await CaseUpdate.find({ caseId: caseDoc._id })
            .populate('updatedBy', 'fullName badgeNumber')
            .populate('evidenceFiles')
            .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, updates, "Case updates fetched successfully")
        );
    });
    //most structured apis
    static assignCaseToPolice = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { policeId } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can assign cases to police");
        }
        

        const filter = {
            _id: caseId,
            ...req.tenantFilter,
            ...req.stationFilter
        }
        // Validate case exists
        const [caseData, police] = await Promise.all([
            Case.findOne(filter).lean(),
            User.findById(policeId).lean()
        ]);

        if (!caseData) {
            throw new apiError(404, "Case not found");
        }
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

        // Only allow assignment if case is PENDING
        if (caseData.status !== "PENDING") {
            throw new apiError(400, "Case must be in PENDING status to be assigned");
        }

        // Don't assign if already assigned to this police
        if (caseData.assignedTo?.toString() === policeId) {
            throw new apiError(400, "Case is already assigned to this police officer");
        }

        // Update case assignment
        const updatedCase = await Case.findOneAndUpdate(
            { _id: caseId, status: "PENDING" },
            {
                assignedTo: policeId,
                assignedBy: currentUser._id,
                status: "ASSIGNED"
            },
            { new: true }
        ).populate([
            { path: 'assignedTo', select: 'fullName email badgeNumber' },
            { path: 'policeStationId', select: 'name' }
        ]);

        if(!updatedCase) {
            throw new apiError(500, "Failed to assign case");
        }

        res.status(200).json(
            new apiResponse(200, updatedCase, "Case assigned to police successfully")
        );



        const afterResponse = async () => {

            const tasks = [];
            // Create case update
            tasks.push(CaseUpdate.create({
            tenantId: caseData.tenantId,
            caseId: caseId,
            updaterRole: currentUser.role,
            updatedBy: currentUser._id,
            updateType: "STATUS_UPDATE",
            previousStatus: "PENDING",
            newStatus: "ASSIGNED",
            remarks: `Case assigned to Police Officer ${police.fullName}`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        }));

        // Notify assigned police
        tasks.push(NotificationService.send({
            tenantId: caseData.tenantId,
            userId: policeId,
            type: "case_assigned_to_police",
            title: "Case Assigned for Investigation",
            message: `You have been assigned to investigate case ${updatedCase.caseId}`,
            channels: ["inapp"]
        }));

        // Notify citizen (if CITIZEN type)
        if (caseData.reporter?.type === "CITIZEN" && caseData.reporter?.citizenId) {
            tasks.push(NotificationService.send({
                tenantId: caseData.tenantId,
                userId: caseData.reporter.citizenId,
                type: "case_investigation_started",
                title: "Investigation Started",
                message: `Your case ${updatedCase.caseId} has been assigned to ${police.fullName}`,
                channels: ["inapp", 
                //    "email"
                ]
            }));
        }

        // Notify guest reporter — email only
        if (caseData.reporter?.type === "GUEST" && caseData.reporter?.email) {
            tasks.push(NotificationService.send({
                tenantId: caseData.tenantId,
                userId: null,
                email: caseData.reporter.email,
                type: "case_reassigned",
                title: "Case Reassigned",
                message: `Your case ${updatedCase.caseId} has been assigned to ${police.fullName}`,
                channels: ["email"]
            }));
        }

        const admins = await User.find(
            { 
            role: "ADMIN", 
            tenantId: caseData.tenantId 
            },
            { _id: 1 }
        ).lean();

        admins.forEach(({ _id }) => {
            tasks.push(NotificationService.send({
                tenantId: caseData.tenantId,
                userId: _id,
                type: "case_reassigned",
                title: "Case Reassigned",
                message: `Case ${updatedCase.caseId} has been assigned to ${police.fullName}`,
                channels: ["inapp"]
            }));
        });

        
        await Promise.all(tasks);
        };

        afterResponse().catch(err =>
            logger.error(`assignCaseToPolice background error [${updatedCase.caseId}]:`, err)
        );
    });

    static reassignCase = wrapAsync(async (req, res) => {
        const { caseId } = req.params;
        const { PoliceId } = req.body;
        const currentUser = req.user;

        if (!currentUser.isStationHead) {
            throw new apiError(403, "Only station heads can reassign cases");
        }

        const filter = {
            _id: caseId,
            ...req.tenantFilter,
            ...req.stationFilter
        }
        // Validate case exists
        const caseData = await Case.findOne(filter);
        if (!caseData) {
            throw new apiError(404, "Case not found");
        }

        // Validate new police
        const newPolice = await User.findById(PoliceId);
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
        if (caseData.status !== 'ASSIGNED') {
            throw new apiError(400, "Only assigned cases can be reassigned");
        }

        const previousPoliceId = caseData.assignedTo;

        // Update case assignment
        const updatedCase = await Case.findOneAndUpdate(
            { _id: caseId },
            {
                assignedTo: PoliceId,
                assignedBy: currentUser._id
            },
            { new: true }
        ).populate([
            { path: 'assignedTo', select: 'fullName email badgeNumber' },
            { path: 'policeStationId', select: 'name' }
        ]);

        if(!updatedCase){
            throw new apiError(500, "Failed to reassign case");
        }

        res.status(200).json(
            new apiResponse(200, updatedCase, 'Case has been reassigned syccessfully')
        )


        const afterResponse = async () => {

            const tasks = []

            tasks.push(CaseUpdate.create({
                    tenantId: caseData.tenantId,
                    caseId: caseId,
                    updaterRole: currentUser.role,
                    updatedBy: currentUser._id,
                    updateType: "STATUS_UPDATE",
                    previousStatus: "ASSIGNED",
                    newStatus: "ASSIGNED",
                    remarks: `Case reassigned from previous officer to ${newPolice.fullName}`,
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"]
                }))
                
            // Police notifications    
            tasks.push(
                NotificationService.send({
                    tenantId: caseData.tenantId,
                    userId: newPolice._id,
                    type: "case_reassignment",
                    title: "Case Reassignment",
                    message: `You have been assigned case ${updatedCase.caseId}`,
                    channels: ["inapp"]
                })
            )

            tasks.push(
                NotificationService.send({
                    tenantId: caseData.tenantId,
                    userId: previousPoliceId,
                    type: "case_reassignment_removed",
                    title: "Case Reassignment",
                    message: `Case ${updatedCase.caseId} has been reassigned to another officer`,
                    channels: ["inapp"]
                })
            )

            // Citizen notifications
            if(caseData.reporter.type === 'CITIZEN' && caseData.reporter?.citizenId) {
                tasks.push(
                    NotificationService.send({
                        tenantId: caseData.tenantId,
                        userId: caseData.reporter.citizenId,
                        type: "case_reassignment",
                        title: "Case Reassignment",
                        message: `Your case ${updatedCase.caseId} has been reassigned to another officer`,
                        channels: ["inapp"]
                    })
                )
            }

            if(caseData.reporter.type === 'GUEST' && caseData.reporter?.email) {
                tasks.push(
                    NotificationService.send({
                        tenantId: caseData.tenantId,
                        userId: null,
                        email: caseData.reporter.email,
                        type: "case_reassignment",
                        title: "Case Reassignment",
                        message: `Your case ${updatedCase.caseId} has been reassigned to another officer`,
                        channels: ["email"]
                    })
                )
            }

            const admins = await User.find(
                { tenantId: caseData.tenantId, role: "ADMIN" },
                { _id: 1 }
            ).lean();

            admins.forEach(({ _id }) => {
            tasks.push(NotificationService.send({
                tenantId: caseData.tenantId,
                userId: _id,
                type: "case_reassigned",
                title: "Case Reassigned",
                message: `Case ${updatedCase.caseId} has been assigned to ${newPolice.fullName}`,
                channels: ["inapp"]
            }));
        });

            await Promise.all(tasks)
        }

        afterResponse().catch(err => 
            logger.error(`ReassignCase background error [${updatedCase.caseId}]`, err)
        )

    });




    //not used
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
    //notused
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

        const { startDate, endDate, period = 'daily' } = req.query;
        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const filter = {
            ...req.tenantFilter,
            ...req.stationFilter,
            ...dateFilter
        };

        const [
            // Overview Cards
            totalCases,
            pendingCases,
            assignedCases,
            underInvestigationCases,
            resolvedCases,
            closedCases,
            totalPolice,
            activePolice,
            
            // Crime Type Breakdown
            crimeTypeBreakdown,
            
            // Severity Distribution
            severityDistribution,
            
            // Police Performance
            policePerformance,
            
            // Time Trends
            timeTrends,
            
            // Resolution Metrics
            avgResolutionTime,
            resolutionRate
        ] = await Promise.all([
            // Overview Cards
            Case.countDocuments(filter),
            Case.countDocuments({ ...filter, status: "PENDING" }),
            Case.countDocuments({ ...filter, status: "ASSIGNED" }),
            Case.countDocuments({ ...filter, status: "UNDER_INVESTIGATION" }),
            Case.countDocuments({ ...filter, status: "RESOLVED" }),
            Case.countDocuments({ ...filter, status: "CLOSED" }),
            User.countDocuments({ role: "POLICE", isStationHead: false, status: "APPROVED", policeStationId: currentUser.policeStationId }),
            User.countDocuments({ role: "POLICE", isStationHead: false, status: "APPROVED", policeStationId: currentUser.policeStationId }),
            
            // Crime Type Breakdown
            Case.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: "$crimeType",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            
            // Severity Distribution
            Case.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: "$severity",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            
            // Police Performance
            User.aggregate([
                {
                    $match: {
                        role: "POLICE",
                        status: "APPROVED",
                        isStationHead: false,
                        policeStationId: currentUser.policeStationId
                    }
                },
                {
                    $lookup: {
                        from: "cases",
                        let: { policeId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$assignedTo", "$$policeId"] },
                                    ...filter
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalAssigned: { $sum: 1 },
                                    resolved: {
                                        $sum: {
                                            $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0]
                                        }
                                    }
                                }
                            }
                        ],
                        as: "caseStats"
                    }
                },
                {
                    $addFields: {
                        totalAssigned: { $ifNull: [{ $arrayElemAt: ["$caseStats.totalAssigned", 0] }, 0] },
                        resolved: { $ifNull: [{ $arrayElemAt: ["$caseStats.resolved", 0] }, 0] }
                    }
                },
                {
                    $addFields: {
                        resolutionRate: {
                            $cond: [
                                { $gt: ["$totalAssigned", 0] },
                                { $multiply: [{ $divide: ["$resolved", "$totalAssigned"] }, 100] },
                                0
                            ]
                        }
                    }
                },
                {
                    $project: {
                        policeId: "$_id",
                        fullName: 1,
                        badgeNumber: 1,
                        email: 1,
                        totalAssigned: 1,
                        resolved: 1,
                        resolutionRate: { $round: ["$resolutionRate", 2] }
                    }
                },
                { $sort: { resolved: -1 } }
            ]),
            
            // Time Trends
            Case.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: period === 'daily' ? { $dayOfMonth: "$createdAt" } : null
                        },
                        totalCases: { $sum: 1 },
                        resolvedCases: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0]
                            }
                        }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
                { $limit: 30 }
            ]),
            
            // Resolution Metrics
            Case.aggregate([
                {
                    $match: {
                        ...filter,
                        status: "RESOLVED",
                        updatedAt: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgResolutionTime: {
                            $avg: {
                                $divide: [
                                    { $subtract: ["$updatedAt", "$createdAt"] },
                                    1000 * 60 * 60 * 24 // Convert to days
                                ]
                            }
                        }
                    }
                }
            ]),
            
            // Resolution Rate
            Case.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        resolved: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        resolutionRate: {
                            $cond: [
                                { $gt: ["$total", 0] },
                                { $multiply: [{ $divide: ["$resolved", "$total"] }, 100] },
                                0
                            ]
                        }
                    }
                }
            ])
        ]);

        const analytics = {
            overview: {
                totalCases,
                pendingCases,
                assignedCases,
                underInvestigationCases,
                resolvedCases,
                closedCases,
                totalPolice,
                activePolice,
                resolutionRate: resolutionRate[0]?.resolutionRate?.toFixed(2) || 0,
                avgResolutionTime: avgResolutionTime[0]?.avgResolutionTime?.toFixed(2) || 0
            },
            crimeTypeBreakdown: crimeTypeBreakdown.map(item => ({
                crimeType: item._id,
                count: item.count,
                percentage: totalCases > 0 ? ((item.count / totalCases) * 100).toFixed(2) : 0
            })),
            severityDistribution: severityDistribution.map(item => ({
                severity: item._id,
                count: item.count,
                percentage: totalCases > 0 ? ((item.count / totalCases) * 100).toFixed(2) : 0
            })),
            policePerformance: policePerformance,
            timeTrends: timeTrends.map(item => ({
                date: period === 'daily' 
                    ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`
                    : `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                totalCases: item.totalCases,
                resolvedCases: item.resolvedCases
            }))
        };

        res.status(200).json(
            new apiResponse(200, analytics, "Station analytics fetched successfully")
        );
    });




}

export default StationHeadController;

