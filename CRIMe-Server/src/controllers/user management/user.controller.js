import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import NotificationService from "../../services/notification.service.js";
import User from "../../models/user.model.js";
import Invite from "../../models/invite.model.js";

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

    static searchUserController = wrapAsync(async(req, res) => {
        const currentUser = req.user;
        let { q = "", page = 1, limit = 10, tenantId: requestedTenantId, role: requestedRole,
            status: requestedStatus
         } = req.query;
        
        //pagination 
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;
    
        const filter = { }
    
        //Tenant filter
        if(currentUser.isSuperAdmin){
            if(!requestedTenantId) throw new apiError(400, 'Tenant ID is required')
            
                // filter.tenantId = requestedTenantId
                filter.tenantId = new mongoose.Types.ObjectId(requestedTenantId);
        } else {
            filter.tenantId = currentUser.tenantId
        }
    
        
        //easier version
        let allowedRoles = [];
    
        if (currentUser.isSuperAdmin) {
        allowedRoles = ['ADMIN', 'POLICE', 'CITIZEN'];
        } else if (currentUser.role === 'ADMIN') {
        allowedRoles = ['POLICE', 'CITIZEN'];
        } else if (currentUser.role === 'POLICE') {
        allowedRoles = ['CITIZEN'];
        } else {
        throw new apiError(403, 'Not allowed to search users');
        }
    
    
    
        if (requestedRole) {
        if (!allowedRoles.includes(requestedRole)) {
            throw new apiError(403, 'Not allowed to search this role');
        }
        filter.role = requestedRole;
        } else {
        filter.role = { $in: allowedRoles };
        }
    
    
        //Status filter
        if(requestedStatus){
            if(!['PENDING', 'APPROVED', 'BLOCKED'].includes(requestedStatus)){
                throw new apiError(400, 'Invalid status')
            }
            if(!(currentUser.isSuperAdmin || currentUser.role === 'ADMIN')){
                throw new apiError(403, 'Not allowed to search users on status');
            }
            filter.status = requestedStatus;
        }
    
        
        //Name search filter
        if( q && q.trim().length > 0){
            const safeQuery = escapeRegex(q.trim());
            filter.fullName = { $regex: safeQuery, $options: 'i' };
        }
    
        //Query
        const users = await User.find(filter)
        .select('-password -nationalIdHash')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
    
        if(users.length === 0){
            throw new apiError(404, 'No users found');
        }
        const total = await User.countDocuments(filter);
    
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
    

    static deleteUserController = wrapAsync(async(req, res) => {
        const currentUser = req.user;
        const targetUserId = req.params.id;
        const tenantId = req.user.tenantId;
    
        let targetUser;
        //tenant isolation
        if(currentUser.isSuperAdmin){
            targetUser = await User.findById(targetUserId);
        }else {
            targetUser = await User.findOne({
                _id: targetUserId,
                tenantId
            })
        }
        if(!targetUser) throw new apiError(400, 'User not found')
    
            
        if(targetUser._id.equals(currentUser._id)){
            throw new apiError(400, 'Cannot delete yourself')
        }
        
        //Authorize Roles
    
        if(currentUser.role === 'CITIZEN' || currentUser.role === 'POLICE'){
            throw new apiError(403, 'Not allowed to delete user')
        }
    
        if(currentUser.role === 'ADMIN' && !currentUser.isSuperAdmin){
            if(targetUser.isSuperAdmin || targetUser.role === 'ADMIN'){
                throw new apiError(403, 'Not allowed to delete super admin or admin')
            }
        }
        if(currentUser.isSuperAdmin){
            if(targetUser.isSuperAdmin){
                throw new apiError(403, 'Not allowed to delete super admin')
            }
        }
    
    
        const deletedUser = await targetUser.deleteOne();
        if(!deletedUser) throw new apiError(400, 'User not deleted')
    
        deletedUser.deletedAt = new Date();
            
        

        if(currentUser.isSuperAdmin || currentUser.role === 'ADMIN'){
            const superAdmin = await User.findOne({ isSuperAdmin: true });
            if(superAdmin){
                await NotificationService.send({
                    tenantId: targetUser.tenantId,
                    userId: superAdmin._id,
                    type: "USER_DELETED",
                    title: "User Deleted",
                    message: `${targetUser.fullName} was deleted by ${currentUser.fullName}`,
                    channels: ["inapp"]
                });
            }
        }        
        
        if(currentUser.role === 'ADMIN' && !currentUser.isSuperAdmin){
        const admins = await User.find({
        tenantId: targetUser.tenantId,
        role: "ADMIN",
        status: "APPROVED",
      });
    
      for (const admin of admins) {
        if (!admin._id.equals(currentUser._id)) {
          await NotificationService.send({
            tenantId: targetUser.tenantId,
            userId: admin._id,
            type: "USER_DELETED",
            title: "User Deleted",
            message: `${targetUser.fullName} was deleted by ${currentUser.fullName}`,
            channels: ["inapp"]
          });
        }
      }}
    
        return res.status(200).json(new apiResponse(200, deletedUser, 'User deleted successfully'))
    
        
        
        })


}

export default UserController;