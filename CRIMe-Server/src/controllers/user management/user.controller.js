import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import NotificationService from "../../services/notification.service.js";
import User from "../../models/user.model.js";
import Tenant from "../../models/tenant.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import Case from "../../models/case.model.js";
import Invite from "../../models/invite.model.js";
import mongoose from "mongoose";
import escapeRegex from "../../utils/escapeRegex.js";



class UserController {
    
    //approve ,reject and block 
    static updateUserStatus = wrapAsync(async (req, res) => {
    const { userId } = req.params;
    const { newStatus } = req.body;
    const currentUser = req.user;

    const validStatuses = ["APPROVED", "BLOCKED", "REJECTED"];
    if (!validStatuses.includes(newStatus)) {
        throw new apiError(400, "Invalid status");
    }

    const user = await User.findById(userId);
    if (!user) throw new apiError(404, "User not found");

    // 🔒 Role hierarchy enforcement
    if (user.role === "POLICE" && currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
        throw new apiError(403, "Only admin can approve police");
    }

    if (user.role === "ADMIN" && !currentUser.isSuperAdmin) {
        throw new apiError(403, "Only super admin can approve admin");
    }

    const previousStatus = user.status;

    if (previousStatus === newStatus) {
        throw new apiError(400, "User already has this status");
    }

    user.status = newStatus;

    let deletedUser = null;
    let userToReturn = user;

    if (newStatus === "APPROVED") {
        user.approvedBy = req.user._id;
        user.approvedAt = new Date();
    }

    if (newStatus === "BLOCKED") {
        user.blockedBy = req.user._id;
        user.blockedAt = new Date();
    }

    if (newStatus === "REJECTED") {
        user.rejectedBy = req.user._id;
        user.rejectedAt = new Date();

        if (previousStatus === "PENDING") {
            const invite = await Invite.findOne({
                email: user.email,
                role: user.role,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });

            if (invite) {
                invite.isUsed = true;
                invite.usedAt = new Date();
                await invite.save();
            }

            deletedUser = await User.findByIdAndDelete(userId);
            userToReturn = user;
        }
    }

    if (!deletedUser) {
        await user.save();
    }

    if(user.role === "POLICE" && newStatus === "APPROVED") {
        await NotificationService.send({
            tenantId: user.tenantId,
            userId: user._id,
            type: "POLICE_APPROVAL",
            title: "Police Account Approved",
            message: "Your police account has been approved",
            channels: ["inapp", 
                 "email"
            ]
        });
    }else if(user.role === "POLICE" && newStatus === "BLOCKED") {
        await NotificationService.send({
            tenantId: user.tenantId,
            userId: user._id,
            type: "POLICE_BLOCKED",
            title: "Police Account Blocked",
            message: "Your police account has been blocked",
            channels: ["inapp", 
                 "email"
            ]
        });
    }
    else if(user.role === "POLICE" && newStatus === "REJECTED") {
        await NotificationService.send({
            tenantId: user.tenantId,
            userId: user._id,
            type: "POLICE_REJECTED",
            title: "Police Account Rejected",
            message: "Your police account has been rejected",
            channels: ["inapp", 
                 "email"
            ]
        });
    }
    else if(user.role === "ADMIN" && newStatus === "APPROVED") {
        await NotificationService.send({
            tenantId: user.tenantId,
            userId: user._id,
            type: "ADMIN_APPROVAL",
            title: "Admin Account Approved",
            message: "Your admin account has been approved",
            channels: ["inapp", 
                "email"
            ]
        });
    }
    else if(user.role === "ADMIN" && newStatus === "BLOCKED") {
        await NotificationService.send({
            tenantId: user.tenantId,
            userId: user._id,
            type: "ADMIN_BLOCKED",
            title: "Admin Account Blocked",
            message: "Your admin account has been blocked",
            channels: ["inapp", 
                 "email"
            ]
        });
    } else if(user.role === "ADMIN" && newStatus === "REJECTED") {
        await NotificationService.send({
            tenantId: user.tenantId,
            userId: user._id,
            type: "ADMIN_REJECTED",
            title: "Admin Account Rejected",
            message: "Your admin account has been rejected",
            channels: ["inapp", 
                 "email"
            ]
        });
    }


    res.status(200).json(
        new apiResponse(200, user, `User ${newStatus.toLowerCase()} successfully`)
    );
    });

    static deleteUserController = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const targetUserId = req.params.id;
        const tenantId = req.user.tenantId;

        const session = await mongoose.startSession();

        try {
            let targetUser;

            await session.withTransaction(async () => {
            if (currentUser.isSuperAdmin) {
                targetUser = await User.findById(targetUserId).session(session);
            } else {
                targetUser = await User.findOne({
                _id: targetUserId,
                tenantId,
                }).session(session);
            }

            if (!targetUser) {
                throw new apiError(400, "User not found");
            }

        
            if (targetUser._id.equals(currentUser._id)) {
                throw new apiError(400, "Cannot delete yourself");
            }

            if (currentUser.role === "CITIZEN" || currentUser.role === "POLICE") {
                throw new apiError(403, "Not allowed to delete user");
            }

            if (currentUser.role === "ADMIN" && !currentUser.isSuperAdmin) {
                if (targetUser.isSuperAdmin || targetUser.role === "ADMIN") {
                throw new apiError(
                    403,
                    "Not allowed to delete super admin or admin"
                );
                }
            }

            if (currentUser.isSuperAdmin && targetUser.isSuperAdmin) {
                throw new apiError(403, "Not allowed to delete super admin");
            }

            
            await Invite.deleteMany({
                tenantId: targetUser.tenantId,
                email: targetUser.email,
            });

            // Clear station head reference if the user was a station head
            if (targetUser.role === "POLICE" && targetUser.isStationHead) {
                await PoliceStation.updateOne(
                    { stationHead: targetUser._id },
                    { stationHead: null },
                    { session }
                );
            }

            // Clear case assignments if the user was a police officer
            if (targetUser.role === "POLICE") {
                await Case.updateMany(
                    { assignedTo: targetUser._id },
                    { assignedTo: null },
                    { session }
                );
            }

            // Clear police station assignment if the user was a police officer
            if (targetUser.role === "POLICE" && targetUser.policeStationId) {
                await User.findByIdAndUpdate(
                    targetUser._id,
                    { policeStationId: null, isStationHead: false },
                    { session }
                );
            }

            await User.deleteOne({ _id: targetUser._id }).session(session);

            });

            if (currentUser.isSuperAdmin) {
            const superAdmin = await User.findOne({ isSuperAdmin: true });

            if (superAdmin) {
                await NotificationService.send({
                tenantId,
                userId: superAdmin._id,
                type: "USER_DELETED",
                title: "User Deleted",
                message: `${targetUser.fullName} was deleted by ${currentUser.fullName}`,
                channels: ["inapp"],
                });
            }
            }

            // 8. Notifications (Admins in same tenant)
            if (currentUser.role === "ADMIN" && !currentUser.isSuperAdmin) {
            const admins = await User.find({
                tenantId,
                role: "ADMIN",
                status: "APPROVED",
            });

            for (const admin of admins) {
                if (!admin._id.equals(currentUser._id)) {
                await NotificationService.send({
                    tenantId,
                    userId: admin._id,
                    type: "USER_DELETED",
                    title: "User Deleted",
                    message: `${targetUser.fullName} was deleted by ${currentUser.fullName}`,
                    channels: ["inapp"],
                });
                }
            }
            }

            await session.endSession();

            return res.status(200).json(
            new apiResponse(200, null, "User deleted successfully")
            );
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();
            throw error;
        }
    });
    



}

export default UserController;