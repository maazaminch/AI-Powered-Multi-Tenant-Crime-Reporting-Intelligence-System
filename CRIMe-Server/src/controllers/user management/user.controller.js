import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import NotificationService from "../../services/notification.service.js";
import User from "../../models/user.model.js";
import Invite from "../../models/invite.model.js";
import Case from "../../models/case.model.js";
import Tenant from "../../models/tenant.model.js";
import PoliceStation from "../../models/policeStation.model.js";
import escapeRegex from "../../utils/escapeRegex.js";
import mongoose from "mongoose";

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

    /**
     * Tenant/role scoped user search reusable by every panel.
     *
     * Scope matrix (caller -> searchable roles / data):
     *   - Super admin   : ADMIN, POLICE, CITIZEN across any tenant (tenantId required)
     *   - Admin         : POLICE (incl. station heads) + CITIZEN within own tenant
     *   - Station head  : POLICE of own station + CITIZENs who filed a case at that station
     *   - Regular police: CITIZENs who filed a case at own station only
     *   - Citizen       : not allowed
     *
     * Text match: fullName, email (+ badgeNumber when the target role is POLICE).
     */
    static searchUserController = wrapAsync(async(req, res) => {
        const currentUser = req.user;
        let { q = "", page = 1, limit = 10, tenantId: requestedTenantId, role: requestedRole,
            status: requestedStatus
         } = req.query;

        //pagination
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        //Caller classification
        const isSuperAdmin = currentUser.isSuperAdmin;
        const isAdmin = !isSuperAdmin && currentUser.role === 'ADMIN';
        const isStationHead = !isSuperAdmin && currentUser.role === 'POLICE' && currentUser.isStationHead;
        const isPolice = !isSuperAdmin && currentUser.role === 'POLICE' && !currentUser.isStationHead;

        let allowedRoles;
        if (isSuperAdmin) allowedRoles = ['ADMIN', 'POLICE', 'CITIZEN'];
        else if (isAdmin) allowedRoles = ['POLICE', 'CITIZEN'];
        else if (isStationHead) allowedRoles = ['POLICE', 'CITIZEN'];
        else if (isPolice) allowedRoles = ['CITIZEN'];
        else throw new apiError(403, 'Not allowed to search users');

        //Restrict to a single requested role when provided
        let targetRoles = allowedRoles;
        if (requestedRole) {
            if (!allowedRoles.includes(requestedRole)) {
                throw new apiError(403, 'Not allowed to search this role');
            }
            targetRoles = [requestedRole];
        }

        //Super admin must target a specific tenant
        if (isSuperAdmin && !requestedTenantId) {
            throw new apiError(400, 'Tenant ID is required');
        }

        //Status filter (only super admin & admin may filter on status)
        let statusFilter = null;
        if (requestedStatus) {
            if (!['PENDING', 'APPROVED', 'BLOCKED', 'REJECTED'].includes(requestedStatus)) {
                throw new apiError(400, 'Invalid status');
            }
            if (!(isSuperAdmin || isAdmin)) {
                throw new apiError(403, 'Not allowed to search users on status');
            }
            statusFilter = requestedStatus;
        }

        const safeQuery = q && q.trim().length > 0 ? escapeRegex(q.trim()) : null;

        //Citizens scoped to a station are derived from the cases filed there
        let stationCitizenIds = null;
        if ((isStationHead || isPolice) && targetRoles.includes('CITIZEN')) {
            stationCitizenIds = await Case.distinct('citizenId', {
                policeStationId: currentUser.policeStationId,
                citizenId: { $ne: null }
            });
        }

        //Build one clause per target role since scope differs per role
        const roleClauses = targetRoles.map((role) => {
            const clause = { role };

            if (isSuperAdmin) {
                clause.tenantId = new mongoose.Types.ObjectId(requestedTenantId);
            } else if (isAdmin) {
                clause.tenantId = currentUser.tenantId;
            } else if (isStationHead) {
                if (role === 'POLICE') clause.policeStationId = currentUser.policeStationId;
                else clause._id = { $in: stationCitizenIds };
            } else if (isPolice) {
                clause._id = { $in: stationCitizenIds };
            }

            if (safeQuery) {
                const textOr = [
                    { fullName: { $regex: safeQuery, $options: 'i' } },
                    { email: { $regex: safeQuery, $options: 'i' } }
                ];
                if (role === 'POLICE') {
                    textOr.push({ badgeNumber: { $regex: safeQuery, $options: 'i' } });
                }
                clause.$or = textOr;
            }

            return clause;
        });

        const filter = roleClauses.length === 1 ? roleClauses[0] : { $or: roleClauses };
        if (statusFilter) {
            filter.status = statusFilter;
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -nationalIdHash')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            User.countDocuments(filter)
        ]);

        return res.status(200)
        .json(new apiResponse(200,
            {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                results: users
            },
            'Users fetched successfully'))

        })


    // Tenant search (super admin only) — by name or code
    static searchTenantsController = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, 'Only SuperAdmin can search tenants');
        }

        let { q = "", page = 1, limit = 10 } = req.query;
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const filter = {};
        if (q && q.trim().length > 0) {
            const safeQuery = escapeRegex(q.trim());
            filter.$or = [
                { name: { $regex: safeQuery, $options: 'i' } },
                { code: { $regex: safeQuery, $options: 'i' } }
            ];
        }

        const [tenants, total] = await Promise.all([
            Tenant.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Tenant.countDocuments(filter)
        ]);

        return res.status(200).json(new apiResponse(200, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            results: tenants
        }, 'Tenants fetched successfully'));
    })


    // Police station search (admin only, own tenant) — by name or code
    static searchStationsController = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (currentUser.role !== 'ADMIN') {
            throw new apiError(403, 'Not allowed to search stations');
        }

        let { q = "", page = 1, limit = 10 } = req.query;
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const filter = { tenantId: currentUser.tenantId };
        if (q && q.trim().length > 0) {
            const safeQuery = escapeRegex(q.trim());
            filter.$or = [
                { name: { $regex: safeQuery, $options: 'i' } },
                { code: { $regex: safeQuery, $options: 'i' } }
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

        return res.status(200).json(new apiResponse(200, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            results: stations
        }, 'Stations fetched successfully'));
    })


    /**
     * Case search scoped by caller:
     *   - Super admin   : any tenant (optionally narrowed by tenantId)
     *   - Admin         : own tenant
     *   - Station head  : cases of own police station
     *   - Regular police: cases assigned to them only
     *   - Citizen       : own cases only
     * Text (q) matches caseId, reporter name, reporting citizen's name, and
     * crimeType / severity when q equals one of those enum values.
     */
    static searchCasesController = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        let { q = "", severity: requestedSeverity, crimeType: requestedCrimeType,
            status: requestedStatus, tenantId: requestedTenantId, page = 1, limit = 10
        } = req.query;

        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const CRIME_TYPES = [
            'THEFT', 'ROBBERY', 'ASSAULT', 'MURDER', 'DOMESTIC_VIOLENCE',
            'CYBER_CRIME', 'KIDNAPPING', 'FRAUD', 'DRUG_OFFENSE',
            'HARASSMENT', 'TRAFFIC_VIOLATION', 'OTHER'
        ];
        const STATUSES = ['PENDING', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'];

        const filter = { isArchived: false };

        if (currentUser.isSuperAdmin) {
            if (requestedTenantId) {
                filter.tenantId = new mongoose.Types.ObjectId(requestedTenantId);
            }
        } else if (currentUser.role === 'ADMIN') {
            filter.tenantId = currentUser.tenantId;
        } else if (currentUser.role === 'POLICE') {
            filter.tenantId = currentUser.tenantId;
            if (currentUser.isStationHead) {
                filter.policeStationId = currentUser.policeStationId;
            } else {
                filter.assignedTo = currentUser._id;
            }
        } else if (currentUser.role === 'CITIZEN') {
            filter.tenantId = currentUser.tenantId;
            filter.citizenId = currentUser._id;
        } else {
            throw new apiError(403, 'Not allowed to search cases');
        }

        if (requestedSeverity) {
            if (!SEVERITIES.includes(requestedSeverity)) throw new apiError(400, 'Invalid severity');
            filter.severity = requestedSeverity;
        }
        if (requestedCrimeType) {
            if (!CRIME_TYPES.includes(requestedCrimeType)) throw new apiError(400, 'Invalid crime type');
            filter.crimeType = requestedCrimeType;
        }
        if (requestedStatus) {
            if (!STATUSES.includes(requestedStatus)) throw new apiError(400, 'Invalid status');
            filter.status = requestedStatus;
        }

        if (q && q.trim()) {
            const raw = q.trim();
            const safeQuery = escapeRegex(raw);
            const upper = raw.toUpperCase();

            const orConditions = [
                { caseId: { $regex: safeQuery, $options: 'i' } },
                { reporterName: { $regex: safeQuery, $options: 'i' } }
            ];
            if (SEVERITIES.includes(upper)) orConditions.push({ severity: upper });
            if (CRIME_TYPES.includes(upper)) orConditions.push({ crimeType: upper });

            const citizenMatch = { role: 'CITIZEN', fullName: { $regex: safeQuery, $options: 'i' } };
            if (filter.tenantId) citizenMatch.tenantId = filter.tenantId;
            const citizenIds = await User.distinct('_id', citizenMatch);
            if (citizenIds.length) orConditions.push({ citizenId: { $in: citizenIds } });

            filter.$or = orConditions;
        }

        const [cases, total] = await Promise.all([
            Case.find(filter)
                .populate('citizenId', 'fullName email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            Case.countDocuments(filter)
        ]);

        return res.status(200).json(new apiResponse(200, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            results: cases
        }, 'Cases fetched successfully'));
    })



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


}

export default UserController;