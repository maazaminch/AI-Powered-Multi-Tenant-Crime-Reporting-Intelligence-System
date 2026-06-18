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

const CRIME_TYPES = [
    "THEFT", "ROBBERY", "ASSAULT", "MURDER", "DOMESTIC_VIOLENCE",
    "CYBER_CRIME", "KIDNAPPING", "FRAUD", "DRUG_OFFENSE",
    "HARASSMENT", "TRAFFIC_VIOLATION", "OTHER"
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const parsePagination = (page, limit) => {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
};

const paginatedMeta = (total, pageNum, limitNum) => {
    const totalPages = Math.ceil(total / limitNum);
    return {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
    };
};

const getStationCitizenIds = async (policeStationId) => {
    return Case.distinct("citizenId", {
        policeStationId,
        citizenId: { $ne: null }
    });
};

const applyUserTextSearch = (filter, q) => {
    if (!q?.trim()) return;

    const safe = escapeRegex(q.trim());
    const textOr = [
        { fullName: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { badgeNumber: { $regex: safe, $options: "i" } }
    ];

    if (filter.$or) {
        const { tenantId, status, ...rest } = filter;
        const scope = { ...rest };
        if (tenantId !== undefined) scope.tenantId = tenantId;
        if (status !== undefined) scope.status = status;
        filter.$and = [{ $or: filter.$or }, { $or: textOr }];
        delete filter.$or;
        Object.assign(filter, scope);
        return;
    }

    const scope = { ...filter };
    Object.keys(scope).forEach((key) => delete filter[key]);
    filter.$and = [scope, { $or: textOr }];
};

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
                email: targetUser.email, // adjust if you use userId instead
            }).session(session);

            
            await User.deleteOne({ _id: targetUser._id }).session(session);

            });

            if (currentUser.isSuperAdmin || currentUser.role === "ADMIN") {
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

    
    // search apis
    static searchUserController = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const {
            q = "",
            page = 1,
            limit = 10,
            tenantId: requestedTenantId,
            role: requestedRole,
            status: requestedStatus
        } = req.query;

        const { pageNum, limitNum, skip } = parsePagination(page, limit);
        const filter = {};

        if (currentUser.isSuperAdmin) {
            if (!requestedTenantId) throw new apiError(400, "Tenant ID is required");
            filter.tenantId = new mongoose.Types.ObjectId(requestedTenantId);
        } else {
            filter.tenantId = currentUser.tenantId;
        }

        let allowedRoles = [];
        if (currentUser.isSuperAdmin) {
            allowedRoles = ["ADMIN", "POLICE", "CITIZEN"];
        } else if (currentUser.role === "ADMIN") {
            allowedRoles = ["POLICE", "CITIZEN"];
        } else if (currentUser.isStationHead) {
            allowedRoles = ["POLICE", "CITIZEN"];
        } else if (currentUser.role === "POLICE") {
            allowedRoles = ["CITIZEN"];
        } else {
            throw new apiError(403, "Not allowed to search users");
        }

        if (requestedRole) {
            if (!allowedRoles.includes(requestedRole)) {
                throw new apiError(403, "Not allowed to search this role");
            }
            if (requestedRole === "POLICE" && currentUser.isStationHead) {
                filter.role = "POLICE";
                filter.policeStationId = currentUser.policeStationId;
            } else if (
                requestedRole === "CITIZEN" &&
                (currentUser.isStationHead || currentUser.role === "POLICE")
            ) {
                const citizenIds = await getStationCitizenIds(currentUser.policeStationId);
                filter.role = "CITIZEN";
                filter._id = { $in: citizenIds };
            } else {
                filter.role = requestedRole;
            }
        } else if (currentUser.isStationHead) {
            const citizenIds = await getStationCitizenIds(currentUser.policeStationId);
            filter.$or = [
                { role: "POLICE", policeStationId: currentUser.policeStationId },
                { role: "CITIZEN", _id: { $in: citizenIds } }
            ];
        } else if (currentUser.role === "POLICE") {
            const citizenIds = await getStationCitizenIds(currentUser.policeStationId);
            filter.role = "CITIZEN";
            filter._id = { $in: citizenIds };
        } else {
            filter.role = { $in: allowedRoles };
        }

        if (requestedStatus) {
            if (!["PENDING", "APPROVED", "BLOCKED"].includes(requestedStatus)) {
                throw new apiError(400, "Invalid status");
            }
            if (!(currentUser.isSuperAdmin || currentUser.role === "ADMIN")) {
                throw new apiError(403, "Not allowed to search users on status");
            }
            filter.status = requestedStatus;
        }

        applyUserTextSearch(filter, q);

        const [users, totalUsers] = await Promise.all([
            User.find(filter)
                .select("-password -nationalIdHash")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
            User.countDocuments(filter)
        ]);

        if (users.length === 0) {
            throw new apiError(404, "No users found");
        }

        return res.status(200).json(
            new apiResponse(200, { users, ...paginatedMeta(totalUsers, pageNum, limitNum) }, "Users fetched successfully")
        );
    });

    static searchTenantController = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const { q = "", page = 1, limit = 10 } = req.query;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Not allowed to search tenants");
        }

        const { pageNum, limitNum, skip } = parsePagination(page, limit);
        const filter = {};

        if (q?.trim()) {
            const safe = escapeRegex(q.trim());
            filter.$or = [
                { name: { $regex: safe, $options: "i" } },
                { code: { $regex: safe, $options: "i" } }
            ];
        }

        const [tenants, total] = await Promise.all([
            Tenant.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean(),
            Tenant.countDocuments(filter)
        ]);

        if (tenants.length === 0) {
            throw new apiError(404, "No tenants found");
        }

        return res.status(200).json(
            new apiResponse(200, { tenants, ...paginatedMeta(total, pageNum, limitNum) }, "Tenants fetched successfully")
        );
    });

    static searchStationController = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const { q = "", page = 1, limit = 10 } = req.query;

        if (currentUser.isSuperAdmin) {
            throw new apiError(403, "Not allowed to search stations");
        }
        if (currentUser.role !== "ADMIN") {
            throw new apiError(403, "Not allowed to search stations");
        }

        const { pageNum, limitNum, skip } = parsePagination(page, limit);
        const filter = { tenantId: currentUser.tenantId };

        if (q?.trim()) {
            const safe = escapeRegex(q.trim());
            filter.$or = [
                { name: { $regex: safe, $options: "i" } },
                { code: { $regex: safe, $options: "i" } }
            ];
        }

        const [stations, total] = await Promise.all([
            PoliceStation.find(filter)
                .populate("stationHead", "fullName email badgeNumber")
                .skip(skip)
                .limit(limitNum)
                .sort({ name: 1 })
                .lean(),
            PoliceStation.countDocuments(filter)
        ]);

        if (stations.length === 0) {
            throw new apiError(404, "No stations found");
        }

        return res.status(200).json(
            new apiResponse(200, { stations, ...paginatedMeta(total, pageNum, limitNum) }, "Stations fetched successfully")
        );
    });

    static searchCaseController = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const {
            q = "",
            tenantId: requestedTenantId,
            page = 1,
            limit = 10
        } = req.query;

        const { pageNum, limitNum, skip } = parsePagination(page, limit);
        const filter = { isArchived: false };

        if (currentUser.isSuperAdmin) {
            if (requestedTenantId) {
                filter.tenantId = new mongoose.Types.ObjectId(requestedTenantId);
            }
        } else {
            filter.tenantId = currentUser.tenantId;
        }

        if (currentUser.role === "CITIZEN") {
            filter.citizenId = currentUser._id;
        } else if (currentUser.isStationHead) {
            filter.policeStationId = currentUser.policeStationId;
        } else if (currentUser.role === "POLICE") {
            filter.assignedTo = currentUser._id;
        }

        if (q?.trim()) {
            const safe = escapeRegex(q.trim());
            const upperQ = safe.toUpperCase();
            const orConditions = [
                { caseId: { $regex: safe, $options: "i" } },
                { reporterName: { $regex: safe, $options: "i" } },
                { crimeType: { $regex: safe, $options: "i" } }
            ];

            if (SEVERITIES.includes(upperQ)) {
                orConditions.push({ severity: upperQ });
            }

            CRIME_TYPES.filter((type) => type.includes(upperQ)).forEach((type) => {
                orConditions.push({ crimeType: type });
            });

            const citizenFilter = {
                role: "CITIZEN",
                fullName: { $regex: safe, $options: "i" }
            };
            if (filter.tenantId) {
                citizenFilter.tenantId = filter.tenantId;
            }

            const matchingCitizens = await User.find(citizenFilter).select("_id").lean();
            if (matchingCitizens.length > 0) {
                orConditions.push({
                    citizenId: { $in: matchingCitizens.map((c) => c._id) }
                });
            }

            filter.$or = orConditions;
        }

        const [cases, total] = await Promise.all([
            Case.find(filter)
                .populate("citizenId", "fullName email")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
            Case.countDocuments(filter)
        ]);

        if (cases.length === 0) {
            throw new apiError(404, "No cases found");
        }

        return res.status(200).json(
            new apiResponse(200, { cases, ...paginatedMeta(total, pageNum, limitNum) }, "Cases fetched successfully")
        );
    });
    



}

export default UserController;