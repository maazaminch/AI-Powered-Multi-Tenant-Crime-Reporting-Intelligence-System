import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import Case from "../../models/case.model.js";
import NotificationService from "../../services/notification.service.js";
import mongoose from "mongoose";
import escapeRegex from "../../utils/escapeRegex.js";

class AdminController {

    // Police Management
    static getPendingPolice = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const filter = {
            role: "POLICE",
            status: "PENDING"
        };

        if (!currentUser.isSuperAdmin) {
            filter.tenantId = currentUser.tenantId;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pendingPolice = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        if (!pendingPolice) {
            throw new apiError(404, "No pending police found");
        }
        
        const totalPendingPolice = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalPendingPolice / limit);

        res.status(200).json(
            new apiResponse(200, 
                {
                    pendingPolice,
                    pagination: {
                        totalPendingPolice,
                        currentPage: page,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }, 
                "Pending police fetched successfully")
        );
    });

    static getAllPolice = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const status = req.query.status;
        const q = req.query.q;
        const stationId = req.query.stationId;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const filter = { role: "POLICE" };
        const validStatuses = ["APPROVED", "BLOCKED"];
        if (status) {
            if (!validStatuses.includes(status)) {
                throw new apiError(400, "Invalid status");
            }
            filter.status = status;
        }

        if (q && q.trim().length > 0) {
            const safe = escapeRegex(q.trim());
            filter.$or = [
                { fullName: { $regex: safe, $options: 'i' } },
                { email: { $regex: safe, $options: 'i' } },
                { badgeNumber: { $regex: safe, $options: 'i' } }
            ];
        }

        if (stationId) {
            if (stationId === 'UNASSIGNED') {
                filter.policeStationId = null; // matches null or missing
            } else {
                filter.policeStationId = stationId;
            }
        }

        if (!currentUser.isSuperAdmin) {
            filter.tenantId = currentUser.tenantId;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const police = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .populate('policeStationId', 'name')
            .skip(skip)
            .limit(limit)
            .lean();

        if (!police) {
            throw new apiError(404, "No police found");
        }
        
        const totalPolice = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalPolice / limit);

        res.status(200).json(
            new apiResponse(200, 
                {
                    police,
                    pagination: {
                        totalPolice,
                        currentPage: page,
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }, 
                "Police fetched successfully")
        );
    });

    static getPoliceDetails = wrapAsync(async (req, res) => {
        const { policeId } = req.params;
        const currentUser = req.user;
        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const police = await User.findById(policeId)
            .select("-password")
            .populate('policeStationId', 'name')
            .lean();

        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        // Tenant isolation
        if (!currentUser.isSuperAdmin && police.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        res.status(200).json(
            new apiResponse(200, police, "Police details fetched successfully")
        );
    });
    
    static assignOrChangeStationHead = wrapAsync(async (req, res) => {

        const { policeId } = req.body;
        const { stationId } = req.params;
        const currentUser = req.user;

        if (!stationId || stationId === "undefined") {
            throw new apiError(400, "Station ID is required");
        }

        if (!policeId || policeId === "undefined") {
            throw new apiError(400, "Police ID is required");
        }

        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Station not found");
        }

        // Tenant isolation
        if (!currentUser.isSuperAdmin && station.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        if (police.role !== "POLICE") {
            throw new apiError(400, "Only police officers can be assigned as station head");
        }
        if (police.status !== "APPROVED") {
            throw new apiError(400, "Police officer must be approved to be assigned as station head");
        }

        if (police.policeStationId?.toString() !== stationId) {
            throw new apiError(400, "Police officer must belong to this station");
        }

        // Check if police is already SHO of another station
        if (police.isStationHead && station.stationHead?.toString() !== policeId) {
            throw new apiError(400, "Police officer is already station head of another station");
        }

        const oldSho = station.stationHead;

        const session = await mongoose.startSession();
        let updatedStation;
        let updatedPolice;
        let isUpdated = false;
        try {
            await session.startTransaction();
            
            if(station.stationHead){
                await User.findByIdAndUpdate(
                    station.stationHead,
                    { isStationHead: false },
                    { new: true, session }
                );
            }


            updatedStation = await PoliceStation.findByIdAndUpdate(
                stationId,
                { stationHead: policeId },
                { new: true, session }
            );

            updatedPolice = await User.findByIdAndUpdate(
                policeId,
                { isStationHead: true },
                { new: true, session }
            );

            if(!updatedStation || !updatedPolice) {
                throw new apiError(500, "Failed to update station head");
            }

            await session.commitTransaction();
            isUpdated = true;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
            
         if (isUpdated){
            const notificationPromises = [
                NotificationService.send({
                    tenantId: updatedPolice.tenantId,
                    userId: policeId,
                    type: "STATION_HEAD_ASSIGNMENT",
                    title: "Station Head Assignment",
                    message: `You have been assigned as the station head of ${updatedStation.name}.`,
                    channels: ["inapp", "email"]
                })
            ];

            if(oldSho){
                notificationPromises.push(
                    NotificationService.send({
                        tenantId: updatedPolice.tenantId,
                        userId: oldSho,
                        type: "STATION_HEAD_REMOVAL",
                        title: "Station Head Removal",
                        message: `You have been removed as the station head of ${updatedStation.name}.`,
                        channels: ["inapp" , "email"]
                    })
                );
            }

            const admins = await User.find({ tenantId: updatedPolice.tenantId, role: "ADMIN" });
            const adminNotificationPromises = admins.map(admin => 
                NotificationService.send({
                    tenantId: updatedPolice.tenantId,
                    userId: admin._id,
                    type: "STATION_HEAD_ASSIGNMENT",
                    title: "Station Head Assignment",
                    message: `${updatedPolice.fullName} has been assigned as the station head of ${updatedStation.name}.`,
                    channels: ["inapp"]
                })
            );
            notificationPromises.push(...adminNotificationPromises);

            await Promise.all(notificationPromises);
        }

        res.status(200).json(
            new apiResponse(200,
                { updatedStation, updatedPolice },
                "Station head assigned successfully"
            )
        );
    });

    static removeStationHead = wrapAsync(async (req, res) => {
        const { stationId } = req.params;
        const currentUser = req.user;

        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Station not found");
        }
        if(!station.stationHead) {
            throw new apiError(400, "This station does not have a station head assigned");
        }

        // Tenant isolation
        if (!currentUser.isSuperAdmin && station.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        const oldSho = await User.findById(station.stationHead);

        if (!oldSho) {
            throw new apiError(404, "Station head user not found");
        }

        const session = await mongoose.startSession();
        let updatedStation;
        let isRemoved = false;
        try {
        await session.startTransaction();
            

            updatedStation = await PoliceStation.findByIdAndUpdate(
                stationId,
                { stationHead: null },
                { new: true, session }
            );

            await User.findByIdAndUpdate(
                oldSho,
                { isStationHead: false },
                { session }
            );

            await session.commitTransaction();
            isRemoved = true;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }

    if (isRemoved){
            const notificationPromises = [
                NotificationService.send({
                    tenantId: updatedStation.tenantId,
                    userId: oldSho,
                    type: "STATION_HEAD_REMOVAL",
                    title: "Station Head Removal",
                    message: `You have been removed as the station head of ${updatedStation.name}.`,
                    channels: ["inapp", "email"]
                })
            ];

            const admins = await User.find({ tenantId: updatedStation.tenantId, role: "ADMIN" });
            const adminNotificationPromises = admins.map(admin => 
                NotificationService.send({
                    tenantId: updatedStation.tenantId,
                    userId: admin._id,
                    type: "STATION_HEAD_REMOVAL",
                    title: "Station Head Removal",
                    message: `${oldSho.fullName} has been removed as the station head of ${updatedStation.name}.`,
                    channels: ["inapp"]
                })
            );
            notificationPromises.push(...adminNotificationPromises);

            await Promise.all(notificationPromises);
        }

        res.status(200).json(
            new apiResponse(200,
                { updatedStation },
                "Station head removed successfully"
            )
         );
    });

    static assignPoliceToStation = wrapAsync(async (req, res) => {
        const { policeId } = req.params;
        const { stationId } = req.body;
        const currentUser = req.user;

        if(currentUser.role !== "ADMIN" ){
            throw new apiError(403, "Only admin can assign police to station");
        }

        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }
        if(police.policeStationId) {
            throw new apiError(400, "Police officer is already assigned to a station");
        }
        if(police.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Police officer does not belong to your tenant");
        }

        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Station not found");
        }
        if(station.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Station does not belong to your tenant");
        }
        if(police.policeStationId?.toString() === stationId) {
            throw new apiError(400, "Police officer is already assigned to this station");
        }

        const updatedPolice = await User.findByIdAndUpdate(
            policeId,
            { policeStationId: stationId },
            { new: true }
        );

        if (!updatedPolice) {
            throw new apiError(500, "Failed to assign police officer to station");
        }

        await NotificationService.send({
            tenantId: updatedPolice.tenantId,
            userId: policeId,
            type: "POLICE_ASSIGNMENT",
            title: "Police Assignment",
            message: `You have been assigned to ${station.name}.`,
            channels: ["inapp"]
        });

        const admins = await User.find({ tenantId: updatedPolice.tenantId, role: "ADMIN" });
        for (const admin of admins) {
            await NotificationService.send({
                tenantId: updatedPolice.tenantId,
                userId: admin._id,
                type: "POLICE_ASSIGNMENT",
                title: "Police Assignment",
                message: `${updatedPolice.fullName} has been assigned to ${station.name}.`,
                channels: ["inapp"]
            });
        }

        res.status(200).json(
            new apiResponse(200,
                updatedPolice,
                "Police officer assigned to station successfully")
        );
    });

    static transferPolice = wrapAsync(async (req, res) => {
        const { policeId } = req.params;
        const { stationId } = req.body;
        const currentUser = req.user;

        if(currentUser.role !== "ADMIN" ){
            throw new apiError(403, "Only admin can transfer police");
        }

        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }
        if (police.isStationHead) {
            throw new apiError(
                400,
                "Remove station head assignment before transferring officer"
            );
        }
        if (police.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(
                403,
                "Police officer does not belong to your tenant"
            );
        }
        if (police.policeStationId?.toString() === stationId) {
            throw new apiError(
                400,
                "Police officer is already assigned to this station"
            );
        }

        const fromStation = await PoliceStation.findById(police.policeStationId);

        const targetStation = await PoliceStation.findById(stationId);
        
        
        if (!targetStation) {
            throw new apiError(404, "Station not found");
        }


        const updatedPolice = await User.findByIdAndUpdate(
            policeId,
            { policeStationId: stationId },
            { new: true }
        );

        if (!updatedPolice) {
            throw new apiError(500, "Failed to transfer police officer");
        }

        await NotificationService.send({
            tenantId: police.tenantId,
            userId: policeId,
            type: "POLICE_TRANSFER",
            title: "Police Transfer",
            message: `You have been transferred to ${targetStation.name}.`,
            channels: ["inapp"]
        });

        const admins = await User.find({ tenantId: police.tenantId, role: "ADMIN" });
        for (const admin of admins) {
            await NotificationService.send({
                tenantId: police.tenantId,
                userId: admin._id,
                type: "POLICE_TRANSFER",
                title: "Police Transfer",
                message: `${police.fullName} has been transferred from ${fromStation.name} to ${targetStation.name}.`,
                channels: ["inapp"]
            });
        }

        res.status(200).json(
            new apiResponse(200,
                updatedPolice,
                "Police officer transferred successfully")
        );
    });

    
    // Case Management (Station Level)

    static getStationCases = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const filter = {
            tenantId: currentUser.tenantId
        };

        const cases = await Case.find(filter)
            .populate('policeStationId', 'stationName')
            .populate('assignedTo', 'fullName badgeNumber')
            .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, cases, "Station cases fetched successfully")
        );
    });

    static getPendingCases = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const pendingCases = await Case.find({
            tenantId: currentUser.tenantId,
            status: "PENDING"
        })
            .populate('citizenId', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, pendingCases, "Pending cases fetched successfully")
        );
    });


    // Analytics Dashboard
    static dashboardStats = wrapAsync(async (req, res) => {
            const currentUser = req.user;

                if (currentUser.role !== "ADMIN") {
                throw new apiError(403, "Only Admin can access dashboard statistics");
                }

            const filter = { tenantId: currentUser.tenantId };
    
            const [
                totalPoliceStations,
                approvedPolice,
                pendingPolice,
                totalCases ] = await Promise.all([
                    PoliceStation.countDocuments(filter),
                    User.countDocuments({ ...filter, role: "POLICE", status: "APPROVED" }),
                    User.countDocuments({ ...filter, role: "POLICE", status: "PENDING" }),
                    Case.countDocuments(filter)
                ]);
    
            res.status(200).json(
                new apiResponse(200, 
                    {
                    totalPoliceStations,
                    approvedPolice,
                    pendingPolice,
                    totalCases
                    },
                     "Dashboard statistics fetched successfully")
            );
    });

    static getTenantAnalytics = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const tenantId = currentUser.tenantId;

        const [
            totalStations,
            activeStations,
            inactiveStations,

            totalPolice,
            totalCitizens,
            pendingPolice,

            totalCases,
            pendingCases,
            assignedCases,
            underInvestigationCases,
            resolvedCases,
            closedCases,

            casesByStation,
            topActiveStations,
            newPoliceThisMonth,
            newCasesThisMonth,

            averageResolutionTime
        ] = await Promise.all([
            PoliceStation.countDocuments({ tenantId }),
            PoliceStation.countDocuments({ tenantId, isActive: true }),
            PoliceStation.countDocuments({ tenantId, isActive: false }),

            User.countDocuments({ tenantId, role: "POLICE", status: "APPROVED" }),
            User.countDocuments({ tenantId, role: "CITIZEN" }),
            User.countDocuments({ tenantId, role: "POLICE", status: "PENDING" }),

            Case.countDocuments({ tenantId }),
            Case.countDocuments({ tenantId, status: "PENDING" }),
            Case.countDocuments({ tenantId, status: "ASSIGNED" }),
            Case.countDocuments({ tenantId, status: "UNDER_INVESTIGATION" }),
            Case.countDocuments({ tenantId, status: "RESOLVED" }),
            Case.countDocuments({ tenantId, status: "CLOSED" }),

            Case.aggregate([
                {
                    $match: { tenantId }
                },
                {
                    $group: {
                        _id: "$policeStationId",
                        caseCount: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: "policeStations",
                        let: { stationId: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$stationId"] } } },
                            { $project: { name: 1 } }
                        ],
                        as: "station"
                    }
                },
                { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        stationId: "$_id",
                        stationName: { $ifNull: ["$station.name", "Unassigned"] },
                        caseCount: 1
                    }
                }
            ]),

            PoliceStation.aggregate([
                {
                    $match: { tenantId }
                },
                {
                    $lookup: {
                        from: "cases",
                        let: { stationId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$policeStationId", "$$stationId"] }
                                }
                            },
                            {
                                $count: "caseCount"
                            }
                        ],
                        as: "caseData"
                    }
                },
                {
                    $addFields: {
                        caseCount: {
                            $ifNull: [
                                { $arrayElemAt: ["$caseData.caseCount", 0] },
                                0
                            ]
                        }
                    }
                },
                { $sort: { caseCount: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        stationId: "$_id",
                        stationName: "$name",
                        caseCount: 1
                    }
                }
            ]),

            User.countDocuments({
                tenantId,
                role: "POLICE",
                status: "APPROVED",
                createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
            }),
            Case.countDocuments({
                tenantId,
                createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
            }),

            Case.aggregate([
                {
                    $match: {
                        tenantId,
                        status: "RESOLVED",
                        resolvedAt: { $exists: true }
                    }
                },
                {
                    $project: {
                        resolutionTime: {
                            $divide: [
                                { $subtract: ["$resolvedAt", "$createdAt"] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgResolutionTime: { $avg: "$resolutionTime" }
                    }
                }
            ])
        ]);

        const tenantAnalytics = {
            stations: {
                total: totalStations,
                active: activeStations,
                inactive: inactiveStations
            },
            users: {
                total: totalPolice + totalCitizens,
                police: totalPolice,
                citizens: totalCitizens,
                pendingPolice
            },
            cases: {
                total: totalCases,
                pending: pendingCases,
                assigned: assignedCases,
                underInvestigation: underInvestigationCases,
                resolved: resolvedCases,
                closed: closedCases
            },
            performance: {
                casesByStation,
                topActiveStations,
                averageResolutionTime: averageResolutionTime[0]?.avgResolutionTime?.toFixed(2) || 0
            },
            trends: {
                newPoliceThisMonth,
                newCasesThisMonth
            }
        };

        res.status(200).json(
            new apiResponse(200, tenantAnalytics, "Tenant analytics fetched successfully")
        );
    });

    static getAdminAnalytics = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const tenantFilter = currentUser.isSuperAdmin ? {}
            : { tenantId: currentUser.tenantId };

        const [
            pendingPoliceCount,
            pendingCasesCount,
            totalCasesCount,
            resolvedCasesCount,
            activePoliceCount,
            totalCitizensCount,
            totalStationsCount
        ] = await Promise.all([
            User.countDocuments({ ...tenantFilter, role: "POLICE", status: "PENDING" }),
            Case.countDocuments({ ...tenantFilter, status: "PENDING" }),
            Case.countDocuments({ ...tenantFilter, isArchived: false }),
            Case.countDocuments({ ...tenantFilter, status: "RESOLVED" }),
            User.countDocuments({ ...tenantFilter, role: "POLICE", status: "APPROVED" }),
            User.countDocuments({ ...tenantFilter, role: "CITIZEN" }),
            PoliceStation.countDocuments(tenantFilter)
        ]);

        const analytics = {
            pendingPolice: pendingPoliceCount,
            pendingCases: pendingCasesCount,
            totalCases: totalCasesCount,
            resolvedCases: resolvedCasesCount,
            activePolice: activePoliceCount,
            totalCitizens: totalCitizensCount,
            totalStations: totalStationsCount
        };

        res.status(200).json(
            new apiResponse(200, analytics, "Admin analytics fetched successfully")
        );
    });



    // Station Management
    static createStation = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }
        

        const { name, location, address, city, sector, contactNumber, email, locationLabel } = req.body;

        const coords = location.coordinates;

        if (!coords || coords.length !== 2) {
        throw new apiError(400, "Location required");
        }

        if (!name || !address || !city || !contactNumber) {
            throw new apiError(400, "Important fields are required");
        }

        const station = await PoliceStation.create({
            tenantId: currentUser.tenantId,
            name,
            location: {
                type: "Point",
                coordinates: [coords[0], coords[1]]
            },
            address,
            locationLabel: locationLabel || null,
            city,
            sector,
            contactNumber,
            email,
            stationHead: null,
            isActive: true,
            createdBy: currentUser._id
        });

        if (!station) {
            throw new apiError(500, "Failed to create station");
        }

        res.status(201).json(
            new apiResponse(201, station, "Station created successfully")
        );
    });

    static deleteStation = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const { stationId } = req.params;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Station not found");
        }

        if (station.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        // Permanently remove the station document
        await PoliceStation.findByIdAndDelete(stationId);

        res.status(200).json(
            new apiResponse(200, {}, "Station deleted successfully")
        );
    });

    static activateOrDeactivateStation = wrapAsync(async(req, res) => {
        const currentUser = req.user;
        const { stationId } = req.params;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Station not found");
        }

        if (station.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        station.isActive = !station.isActive;
        await station.save();

        res.status(200).json(
            new apiResponse(200, station, "Station activated/deactivated successfully")
        );
    });

    static getStations = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalStations = await PoliceStation.countDocuments({ tenantId: currentUser.tenantId });

        const stations = await PoliceStation.find({
            tenantId: currentUser.tenantId
        })
            .populate('stationHead', 'fullName email badgeNumber')
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        const totalPages = Math.ceil(totalStations / limit);         

        res.status(200).json(
            new apiResponse(200, { 
                stations,
                pagination: {
                    totalPages,
                    currentPage: page,
                    totalStations,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, 
            "Stations fetched successfully")
        );
    });

    static getStationDetails = wrapAsync(async (req, res) => {
        const { stationId } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Access denied");
        }

        const station = await PoliceStation.findById(stationId)
            .populate('stationHead', 'fullName email phone badgeNumber')
            .populate({
                path: 'tenantId',
                select: 'name code region'
            });

        if (!station) {
            throw new apiError(404, "Station not found");
        }

        // Tenant isolation
        if (!currentUser.isSuperAdmin && station.tenantId._id.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        res.status(200).json(
            new apiResponse(200, station, "Station details fetched successfully")
        );
    });
}

export default AdminController;
