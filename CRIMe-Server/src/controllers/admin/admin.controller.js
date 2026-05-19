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

    //handeled in user management
    // static approvePolice = wrapAsync(async (req, res) => {
    //     const { userId } = req.params;
    //     const { stationId } = req.body;
    //     const currentUser = req.user;

    //     const police = await User.findById(userId);
    //     if (!police) {
    //         throw new apiError(404, "Police officer not found");
    //     }

    //     if (police.role !== "POLICE") {
    //         throw new apiError(400, "User is not a police officer");
    //     }

    //     // Role hierarchy enforcement
    //     if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
    //         throw new apiError(403, "Only admin can approve police");
    //     }

    //     // Tenant isolation
    //     if (!currentUser.isSuperAdmin && police.tenantId?.toString() !== currentUser.tenantId.toString()) {
    //         throw new apiError(403, "Access denied");
    //     }

    //     if (police.status === "APPROVED") {
    //         throw new apiError(400, "Police officer already approved");
    //     }

    //     // Validate station exists
    //     const station = await PoliceStation.findById(stationId);
    //     if (!station) {
    //         throw new apiError(404, "Police station not found");
    //     }

    //     // Tenant isolation for station
    //     if (!currentUser.isSuperAdmin && station.tenantId.toString() !== currentUser.tenantId.toString()) {
    //         throw new apiError(403, "Access denied");
    //     }

    //     // Update police status and assign to station
    //     const updatedPolice = await User.findByIdAndUpdate(
    //         userId,
    //         {
    //             status: "APPROVED",
    //             policeStationId: stationId
    //         },
    //         { new: true }
    //     ).select("-password");

    //     // Send notification
    //     await NotificationService.send({
    //         tenantId: station.tenantId,
    //         userId: userId,
    //         type: "POLICE_APPROVAL",
    //         title: "Police Account Approved",
    //         message: `Your police account has been approved and assigned to ${station.stationName}`,
    //         channels: ["inapp", "email"]
    //     });

    //     res.status(200).json(
    //         new apiResponse(200, updatedPolice, "Police officer approved successfully")
    //     );
    // });

    // static rejectPolice = wrapAsync(async (req, res) => {
    //     const { userId } = req.params;
    //     const { reason } = req.body;
    //     const currentUser = req.user;

    //     const police = await User.findById(userId);
    //     if (!police) {
    //         throw new apiError(404, "Police officer not found");
    //     }

    //     if (police.role !== "POLICE") {
    //         throw new apiError(400, "User is not a police officer");
    //     }

    //     // Role hierarchy enforcement
    //     if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
    //         throw new apiError(403, "Only admin can reject police");
    //     }

    //     // Tenant isolation
    //     if (!currentUser.isSuperAdmin && police.tenantId?.toString() !== currentUser.tenantId.toString()) {
    //         throw new apiError(403, "Access denied");
    //     }

    //     if (police.status === "BLOCKED") {
    //         throw new apiError(400, "Police officer already blocked");
    //     }

    //     // Update police status
    //     const updatedPolice = await User.findByIdAndUpdate(
    //         userId,
    //         { status: "BLOCKED" },
    //         { new: true }
    //     ).select("-password");

    //     // Send notification
    //     await NotificationService.send({
    //         tenantId: police.tenantId,
    //         userId: userId,
    //         type: "POLICE_REJECTED",
    //         title: "Police Account Rejected",
    //         message: `Your police account has been rejected. Reason: ${reason || "Not specified"}`,
    //         channels: ["inapp"]
    //     });

    //     res.status(200).json(
    //         new apiResponse(200, updatedPolice, "Police officer rejected successfully")
    //     );
    // });



    // Station Head Management
    
    
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
}

export default AdminController;
