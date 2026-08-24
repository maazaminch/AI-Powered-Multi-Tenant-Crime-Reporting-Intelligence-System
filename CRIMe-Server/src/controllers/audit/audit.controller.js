import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import AuditLog from "../../models/auditLog.model.js";
import User from "../../models/user.model.js";
import { Roles, UserFlags } from "../../constants/roles.js";

class AuditController {
  /**
   * Get audit logs with role-based access control
   * Super Admin: Can see all tenant logs, filter by tenant
   * Regular Admin: Can only see their own tenant logs
   */
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

    // Pagination
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;
    
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate('actor.userId', 'fullName email')
      .populate('tenantId', 'name');

    const total = await AuditLog.countDocuments(filter);
    const totalPages = Math.ceil(total / parsedLimit);

    res.status(200).json(
      new apiResponse(200, 
        {
          logs,
          pagination: {
            total,
            currentPage: parsedPage,
            limit: parsedLimit,
            totalPages,
            hasNextPage: parsedPage < totalPages,
            hasPrevPage: parsedPage > 1
          }
        }, 
        "Audit logs fetched successfully")
    );
  });

  // /**
  //  * Get audit log by ID with access control
  //  */
  // static getAuditLogById = wrapAsync(async (req, res) => {
  //   const { id } = req.params;

  //   const log = await AuditLog.findById(id)
  //     .populate('actor.userId', 'fullName email')
  //     .populate('tenantId', 'name');

  //   if (!log) {
  //     throw new apiError(404, 'Audit log not found');
  //   }

  //   // Access Control
  //   if (!req.user.isSuperAdmin && log.tenantId?.toString() !== req.user.tenantId?.toString()) {
  //     throw new apiError(403, 'Access denied - cannot view logs from other tenants');
  //   }

  //   res.status(200).json(
  //     new apiResponse(200, log, 'Audit log fetched successfully')
  //   );
  // });

  /**
   * Get audit statistics
   */
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

    // // Logs by action type
    // const logsByAction = await AuditLog.aggregate([
    //   { $match: filter },
    //   { $group: { _id: '$action', count: { $sum: 1 } } },
    //   { $sort: { count: -1 } }
    // ]);

    // // Logs by target type
    // const logsByTarget = await AuditLog.aggregate([
    //   { $match: filter },
    //   { $group: { _id: '$targetType', count: { $sum: 1 } } },
    //   { $sort: { count: -1 } }
    // ]);

    res.status(200).json(
      new apiResponse(200, 
        {
          totalLogs,
          errorLogs,
          recentLogs,
          errorRate,
          // logsByAction,
          // logsByTarget
        }, 
        "Audit statistics fetched successfully")
    );
  });

//   /**
//    * Get user activity logs
//    */
//   static getUserActivity = wrapAsync(async (req, res) => {
//     const { userId } = req.params;
//     const { page = 1, limit = 20 } = req.query;

//     let filter = { 'actor.userId': userId };

//     // Access Control
//     if (!req.user.isSuperAdmin) {
//       // Regular admin can only see users from their tenant
//       const userInTenant = await AuditLog.findOne({
//         'actor.userId': userId,
//         tenantId: req.user.tenantId
//       });

//       if (!userInTenant) {
//         throw new apiError(403, 'Access denied - user not in your tenant');
//       }
//       filter.tenantId = req.user.tenantId;
//     }

//     const parsedPage = parseInt(page);
//     const parsedLimit = parseInt(limit);
//     const skip = (parsedPage - 1) * parsedLimit;

//     const logs = await AuditLog.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parsedLimit)
//       .populate('actor.userId', 'fullName email');

//     const total = await AuditLog.countDocuments(filter);
//     const totalPages = Math.ceil(total / parsedLimit);

//     res.status(200).json(
//       new apiResponse(200, 
//         {
//           logs,
//           pagination: {
//             total,
//             currentPage: parsedPage,
//             limit: parsedLimit,
//             totalPages,
//             hasNextPage: parsedPage < totalPages,
//             hasPrevPage: parsedPage > 1
//           }
//         }, 
//         "User activity fetched successfully")
//     );
//   });
}

export default AuditController;