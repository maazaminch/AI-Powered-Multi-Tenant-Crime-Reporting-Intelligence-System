import wrapAsync from "../utils/wrapAsync.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Tenant from "../models/tenant.model.js";
import PoliceStation from "../models/policeStation.model.js";
import NotificationService from "./notification.service.js";

class TenantTransferService {

    // static assignAdminToTenant = async (adminId, tenantId, superAdminUser) => {

    //     if (!superAdminUser?.isSuperAdmin) {
    //         throw new apiError(403, "Only SuperAdmin can assign admin");
    //     }

    //     const admin = await User.findById(adminId);
    //     if (!admin) throw new apiError(404, "Admin not found");

    //     if (admin.role !== "ADMIN") {
    //         throw new apiError(400, "Only ADMIN role allowed");
    //     }

    //     if (admin.tenantId) {
    //         throw new apiError(400, "Admin already has tenant. Use transfer");
    //     }

    //     const tenant = await Tenant.findById(tenantId);
    //     if (!tenant) throw new apiError(404, "Tenant not found");

    //     if (!tenant.isActive) {
    //         throw new apiError(400, "Tenant not active");
    //     }

    //     // ✅ Just assign
    //     admin.tenantId = tenantId;
    //     await admin.save();

    //     await NotificationService.send({
    //         tenantId,
    //         userId: adminId,
    //         type: "ADMIN_ASSIGNED",
    //         title: "Tenant Assignment",
    //         message: `You have been assigned to ${tenant.name}`,
    //         channels: ["inapp"]
    //     });

    //     return { admin, tenant };
    // };

    // static transferAdminToTenant = wrapAsync(async (adminId, newTenantId, superAdminUser) => {

    //     if (!superAdminUser?.isSuperAdmin) {
    //         throw new apiError(403, "Only SuperAdmin can transfer admin");
    //     }

    //     const admin = await User.findById(adminId);
    //     if (!admin) throw new apiError(404, "Admin not found");

    //     if (admin.role !== "ADMIN") {
    //         throw new apiError(400, "Only ADMIN role allowed");
    //     }

    //     if (!admin.tenantId) {
    //         throw new apiError(400, "Admin has no tenant. Use assign API");
    //     }

    //     if (admin.tenantId.toString() === newTenantId) {
    //         throw new apiError(400, "Already in this tenant");
    //     }

    //     const newTenant = await Tenant.findById(newTenantId);
    //     if (!newTenant) throw new apiError(404, "Tenant not found");

    //     if (!newTenant.isActive) {
    //         throw new apiError(400, "Tenant not active");
    //     }

    //     const previousTenantId = admin.tenantId;

    //     // ✅ Just move admin
    //     admin.tenantId = newTenantId;
    //     await admin.save();

    //     await NotificationService.send({
    //         tenantId: newTenantId,
    //         userId: adminId,
    //         type: "ADMIN_TRANSFERRED",
    //         title: "Admin Transfer",
    //         message: `You have been transferred to ${newTenant.name}`,
    //         channels: ["inapp"]
    //     });

    //     return {
    //         admin,
    //         previousTenantId,
    //         newTenant
    //     };
    // });

    static transferPoliceToStation = wrapAsync(async (policeId, newStationId, adminUser) => {
        // Validate admin permissions
        if (adminUser.role !== "ADMIN" && !adminUser.isSuperAdmin) {
            throw new apiError(403, "Only admins can transfer police between stations");
        }

        // Validate police exists
        const police = await User.findById(policeId);
        if (!police) {
            throw new apiError(404, "Police officer not found");
        }

        if (police.role !== "POLICE") {
            throw new apiError(400, "Only police officers can be transferred");
        }

        // Validate new station exists
        const newStation = await PoliceStation.findById(newStationId);
        if (!newStation) {
            throw new apiError(404, "New station not found");
        }

        // Tenant isolation
        if (!adminUser.isSuperAdmin) {
            if (newStation.tenantId.toString() !== adminUser.tenantId.toString()) {
                throw new apiError(403, "Access denied");
            }
            if (police.tenantId?.toString() !== adminUser.tenantId.toString()) {
                throw new apiError(403, "Access denied");
            }
        }

        // Don't transfer if already in same station
        if (police.policeStationId?.toString() === newStationId) {
            throw new apiError(400, "Police officer is already in this station");
        }

        const previousStationId = police.policeStationId;

        // Remove from current station head role if applicable
        if (police.isStationHead && previousStationId) {
            await PoliceStation.findByIdAndUpdate(
                previousStationId,
                { stationHead: null }
            );
        }

        // Transfer police to new station and tenant
        const updatedPolice = await User.findByIdAndUpdate(
            policeId,
            { 
                policeStationId: newStationId,
                tenantId: newStation.tenantId,
                isStationHead: false // Reset station head status
            },
            { new: true }
        ).select('-password');

        // Send notification to police
        await NotificationService.send({
            tenantId: newStation.tenantId,
            userId: policeId,
            type: "police_transferred",
            title: "Police Transfer",
            message: `You have been transferred to ${newStation.stationName}`,
            channels: ["inapp", "email"]
        });

        return {
            police: updatedPolice,
            previousStationId,
            newStation: newStation
        };
    });


}

export default TenantTransferService;
