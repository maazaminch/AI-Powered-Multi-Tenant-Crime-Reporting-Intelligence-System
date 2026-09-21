import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import AuditLog from "../../models/auditLog.model.js";
import User from "../../models/user.model.js";
import { Roles, UserFlags } from "../../constants/roles.js";

class AuditController {
  
  static getAuditLogs = wrapAsync(async (req, res) => {
    const {
      tenantId,
      action,
      targetType,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    
    let filter = {};

    // Access Control: Super Admin vs Regular Admin
    if (req.user.isSuperAdmin) {
      // Super admin can filter by tenantId if provided, otherwise see all
      if (tenantId) {
        filter.tenantId = tenantId;
      }
    } else {
      // Regular admin only sees their own tenant's logs
      filter.tenantId = req.user.tenantId;
    }

    // Apply specific filters (when not using search)
    if (!search) {
      if (action) filter.action = action;
      if (targetType) filter.targetType = targetType;
      if (userId) filter['actor.userId'] = userId;
    }

    // Date range filter (applies to both search and specific filters)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Comprehensive search across multiple fields
    if (search) {
      const searchConditions = [
        { action: { $regex: search, $options: 'i' } },                // Action
        { targetType: { $regex: search, $options: 'i' } },            // Target type
        { description: { $regex: search, $options: 'i' } },           // Description
        { targetName: { $regex: search, $options: 'i' } }             // Target name
      ];

      // Only add targetId condition if search is a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);
      if (isValidObjectId) {
        searchConditions.push({ targetId: search });  // Case ID (exact match)
      }

      // Search by user name and email - need to find users first
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      if (users.length > 0) {
        const userIds = users.map(u => u._id);
        searchConditions.push({ 'actor.userId': { $in: userIds } });
      }

      // Combine existing filter with search conditions
      const baseFilter = { ...filter };
      filter = {
        $and: [
          baseFilter,
          { $or: searchConditions }
        ]
      };
    }

    
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor.userId', 'fullName email')
      .populate('tenantId', 'name');

    const totalLogs = await AuditLog.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limit);

    res.status(200).json(
      new apiResponse(200, 
        {
          logs,
          pagination: {
            totalLogs,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }, 
        "Audit logs fetched successfully")
    );
  });

  
  static getAuditStats = wrapAsync(async (req, res) => {
    let filter = {};

    // Access Control
    if (!req.user.isSuperAdmin) {
      filter.tenantId = req.user.tenantId;
    }

    const totalLogs = await AuditLog.countDocuments(filter);
    const errorLogs = await AuditLog.countDocuments({ ...filter, success: false });
    const recentLogs = await AuditLog.countDocuments({
      ...filter,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const errorRate = totalLogs > 0 ? Math.round((errorLogs / totalLogs) * 100) : 0;


    res.status(200).json(
      new apiResponse(200, 
        {
          totalLogs,
          errorLogs,
          recentLogs,
          errorRate
        }, 
        "Audit statistics fetched successfully")
    );
  });

  static recentActivities = wrapAsync(async (req, res) => {
    let filter = {};

    // Access Control
    if (!req.user.isSuperAdmin) {
      filter.tenantId = req.user.tenantId;
    }

    const recentActivities = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('actor.userId', 'fullName email')
      .populate('tenantId', 'name');

    res.status(200).json(
      new apiResponse(200, 
        {
          recentActivities
        }, 
        "Recent activity fetched successfully")
    );
  });

}

export default AuditController;