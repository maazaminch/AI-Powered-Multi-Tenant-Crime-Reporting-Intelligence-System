import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import Case from "../../models/case.model.js";
import escapeRegex from "../../utils/escapeRegex.js";
import StationHeadService from "../../services/stationHead.service.js";
import CaseAssignmentService from "../../services/caseAssignment.service.js";
import TenantTransferService from "../../services/tenantTransfer.service.js";
import NotificationService from "../../services/notification.service.js";

class AdminController {

    // Police Management
    static getPendingPolice = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const filter = {
            role: "POLICE",
            status: "PENDING"
        };

        if (!currentUser.isSuperAdmin) {
            filter.tenantId = currentUser.tenantId;
        }

        const pendingPolice = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 });

        if (!pendingPolice || pendingPolice.length === 0) {
            throw new apiError(404, "No pending police found");
        }

        res.status(200).json(
            new apiResponse(200, pendingPolice, "Pending police fetched successfully")
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
        

        const { name, code, address, city, sector, contactNumber, email} = req.body;

        if (!name || !sector || !address || !city || !contactNumber) {
            throw new apiError(400, "Important fields are required");
        }

        const station = await PoliceStation.create({
            tenantId: currentUser.tenantId,
            name,
            code,
            address,
            city,
            sector,
            contactNumber,
            email,
            createdBy: currentUser._id
        });

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

        const stations = await PoliceStation.find({
            tenantId: currentUser.tenantId
        })
            .populate('stationHead', 'fullName email badgeNumber')
            .sort({ name: 1 });

        res.status(200).json(
            new apiResponse(200, stations, "Stations fetched successfully")
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

    // Police station search — admin only, scoped to its own tenant. By name or code.
    static searchStations = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Not allowed to search stations");
        }

        let { q = "", page = 1, limit = 10 } = req.query;
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const filter = { tenantId: currentUser.tenantId };

        if (q && q.trim().length > 0) {
            const safeQuery = escapeRegex(q.trim());
            filter.$or = [
                { name: { $regex: safeQuery, $options: "i" } },
                { code: { $regex: safeQuery, $options: "i" } }
            ];
        }

        const [stations, total] = await Promise.all([
            PoliceStation.find(filter)
                .populate('stationHead', 'fullName email badgeNumber')
                .skip(skip)
                .limit(limit)
                .sort({ name: 1 }),
            PoliceStation.countDocuments(filter)
        ]);

        return res.status(200).json(
            new apiResponse(200, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                results: stations
            }, "Stations fetched successfully")
        );
    });
}

export default AdminController;
