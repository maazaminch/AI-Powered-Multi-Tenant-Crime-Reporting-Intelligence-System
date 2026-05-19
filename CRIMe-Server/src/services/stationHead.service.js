import wrapAsync from "../utils/wrapAsync.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import PoliceStation from "../models/policeStation.model.js";
import NotificationService from "./notification.service.js";

class StationHeadService {

    static assignStationHead = wrapAsync(async (stationId, policeId, adminUser) => {
        // Validate station exists
        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Police station not found");
        }

        // Validate police exists and belongs to station
        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        if (police.role !== "POLICE") {
            throw new apiError(400, "Only police officers can be assigned as station head");
        }

        if (police.policeStationId?.toString() !== stationId) {
            throw new apiError(400, "Police officer must belong to this station");
        }

        // Tenant isolation
        if (!adminUser.isSuperAdmin && station.tenantId.toString() !== adminUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        // Check if station already has a head
        if (station.stationHead) {
            // Remove current station head
            await User.findByIdAndUpdate(station.stationHead, { isStationHead: false });
        }

        // Check if police is already head of another station
        if (police.isStationHead) {
            await PoliceStation.findOneAndUpdate(
                { stationHead: policeId },
                { stationHead: null }
            );
        }

        // Assign new station head
        const [updatedStation, updatedPolice] = await Promise.all([
            PoliceStation.findByIdAndUpdate(
                stationId,
                { stationHead: policeId },
                { new: true }
            ).populate('stationHead', 'fullName email badgeNumber'),
            
            User.findByIdAndUpdate(
                policeId,
                { isStationHead: true },
                { new: true }
            ).select('-password')
        ]);

        // Send notification to new station head
        await NotificationService.send({
            tenantId: station.tenantId,
            userId: policeId,
            type: "station_head_assigned",
            title: "Station Head Assigned",
            message: `You have been assigned as Station Head of ${station.stationName}`,
            channels: ["inapp", "email"]
        });

        return {
            station: updatedStation,
            stationHead: updatedPolice
        };
    });

    static removeStationHead = wrapAsync(async (stationId, adminUser) => {
        const station = await PoliceStation.findById(stationId);
        if (!station) {
            throw new apiError(404, "Police station not found");
        }

        // Tenant isolation
        if (!adminUser.isSuperAdmin && station.tenantId.toString() !== adminUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        if (!station.stationHead) {
            throw new apiError(400, "No station head assigned to this station");
        }

        // Remove station head
        const [updatedStation, updatedPolice] = await Promise.all([
            PoliceStation.findByIdAndUpdate(
                stationId,
                { stationHead: null },
                { new: true }
            ),
            
            User.findByIdAndUpdate(
                station.stationHead,
                { isStationHead: false },
                { new: true }
            ).select('-password')
        ]);

        // Send notification to previous station head
        await NotificationService.send({
            tenantId: station.tenantId,
            userId: station.stationHead,
            type: "station_head_removed",
            title: "Station Head Removed",
            message: `You have been removed as Station Head of ${station.stationName}`,
            channels: ["inapp", "email"]
        });

        return {
            station: updatedStation,
            previousStationHead: updatedPolice
        };
    });

    static transferStationHead = wrapAsync(async (fromStationId, toStationId, policeId, adminUser) => {
        // Validate both stations
        const [fromStation, toStation] = await Promise.all([
            PoliceStation.findById(fromStationId),
            PoliceStation.findById(toStationId)
        ]);

        if (!fromStation || !toStation) {
            throw new apiError(404, "One or both stations not found");
        }

        // Validate police
        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        if (police.role !== "POLICE") {
            throw new apiError(400, "Only police officers can be assigned as station head");
        }

        // Tenant isolation
        if (!adminUser.isSuperAdmin) {
            if (fromStation.tenantId.toString() !== adminUser.tenantId.toString() ||
                toStation.tenantId.toString() !== adminUser.tenantId.toString()) {
                throw new apiError(403, "Access denied");
            }
        }

        // Police must belong to target station
        if (police.policeStationId?.toString() !== toStationId) {
            throw new apiError(400, "Police officer must belong to the target station");
        }

        // Remove from current station (if any)
        if (police.isStationHead) {
            await PoliceStation.findOneAndUpdate(
                { stationHead: policeId },
                { stationHead: null }
            );
        }

        // Remove current head from target station (if any)
        if (toStation.stationHead) {
            await User.findByIdAndUpdate(toStation.stationHead, { isStationHead: false });
        }

        // Assign to new station
        const [updatedFromStation, updatedToStation, updatedPolice] = await Promise.all([
            PoliceStation.findByIdAndUpdate(
                fromStationId,
                { stationHead: null },
                { new: true }
            ),
            
            PoliceStation.findByIdAndUpdate(
                toStationId,
                { stationHead: policeId },
                { new: true }
            ).populate('stationHead', 'fullName email badgeNumber'),
            
            User.findByIdAndUpdate(
                policeId,
                { isStationHead: true },
                { new: true }
            ).select('-password')
        ]);

        // Send notifications
        await Promise.all([
            NotificationService.send({
                tenantId: toStation.tenantId,
                userId: policeId,
                type: "station_head_transferred",
                title: "Station Head Transferred",
                message: `You have been transferred and assigned as Station Head of ${toStation.stationName}`,
                channels: ["inapp", "email"]
            })
        ]);

        return {
            fromStation: updatedFromStation,
            toStation: updatedToStation,
            stationHead: updatedPolice
        };
    });

    static getStationHead = wrapAsync(async (stationId, currentUser) => {
        const station = await PoliceStation.findById(stationId)
            .populate('stationHead', 'fullName email badgeNumber phone');

        if (!station) {
            throw new apiError(404, "Police station not found");
        }

        // Tenant isolation
        if (!currentUser.isSuperAdmin && station.tenantId.toString() !== currentUser.tenantId.toString()) {
            throw new apiError(403, "Access denied");
        }

        return {
            station: station,
            stationHead: station.stationHead
        };
    });

}

export default StationHeadService;
