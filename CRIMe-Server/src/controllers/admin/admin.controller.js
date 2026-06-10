import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import Case from "../../models/case.model.js";
import StationHeadService from "../../services/stationHead.service.js";
import CaseAssignmentService from "../../services/caseAssignment.service.js";
import TenantTransferService from "../../services/tenantTransfer.service.js";
import NotificationService from "../../services/notification.service.js";

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
            .limit(limit);

        if (!pendingPolice || pendingPolice.length === 0) {
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


    static assignStationHead = wrapAsync(async (req, res) => {
        const { stationId, policeId } = req.body;
        const currentUser = req.user;

        const result = await StationHeadService.assignStationHead(stationId, policeId, currentUser);

        res.status(200).json(
            new apiResponse(200, result, "Station head assigned successfully")
        );
    });

    static removeStationHead = wrapAsync(async (req, res) => {
        const { stationId } = req.params;
        const currentUser = req.user;

        const result = await StationHeadService.removeStationHead(stationId, currentUser);

        res.status(200).json(
            new apiResponse(200, result, "Station head removed successfully")
        );
    });

    static transferStationHead = wrapAsync(async (req, res) => {
        const { fromStationId, toStationId, policeId } = req.body;
        const currentUser = req.user;

        const result = await StationHeadService.transferStationHead(fromStationId, toStationId, policeId, currentUser);

        res.status(200).json(
            new apiResponse(200, result, "Station head transferred successfully")
        );
    });

    static getStationHead = wrapAsync(async (req, res) => {
        const { stationId } = req.params;
        const currentUser = req.user;

        const result = await StationHeadService.getStationHead(stationId, currentUser);

        res.status(200).json(
            new apiResponse(200, result, "Station head details fetched successfully")
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
        

        const { name, location, address, city, sector, contactNumber, email} = req.body;

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

        await station.deleteOne();
        station.deletedAt = new Date();
        await station.save();

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
            .populate('stationHead', 'fullName email badgeNumber')
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
