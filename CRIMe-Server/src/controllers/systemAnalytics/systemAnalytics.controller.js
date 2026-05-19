// import wrapAsync from "../../utils/wrapAsync.js";
// import apiError from "../../utils/apiError.js";
// import apiResponse from "../../utils/apiResponse.js";
// import Case from "../../models/case.model.js";
// import User from "../../models/user.model.js";
// import Tenant from "../../models/tenant.model.js";
// import PoliceStation from "../../models/policeStation.model.js";
// import AuditLog from "../../models/auditLog.model.js";

// class SystemAnalyticsController {

//     static getSystemOverviewController = wrapAsync(async (req, res) => {
//         const currentUser = req.user;

//         if (!currentUser.isSuperAdmin) {
//             throw new apiError(403, "Only SuperAdmin can access system overview");
//         }

//         const { startDate, endDate } = req.query;

//         const dateFilter = {};
//         if (startDate || endDate) {
//             dateFilter.createdAt = {};
//             if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
//             if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
//         }

//         const [
//             totalTenants,
//             activeTenants,
//             totalAdmins,
//             activeAdmins,
//             totalPolice,
//             activePolice,
//             totalCitizens,
//             totalCases,
//             resolvedCases,
//             activeCases
//         ] = await Promise.all([
//             Tenant.countDocuments(),
//             Tenant.countDocuments({ isActive: true }),
//             User.countDocuments({ role: "ADMIN" }),
//             User.countDocuments({ role: "ADMIN", status: "APPROVED" }),
//             User.countDocuments({ role: "POLICE" }),
//             User.countDocuments({ role: "POLICE", status: "APPROVED" }),
//             User.countDocuments({ role: "CITIZEN" }),
//             Case.countDocuments({ ...dateFilter }),
//             Case.countDocuments({ status: "RESOLVED", ...dateFilter }),
//             Case.countDocuments({ 
//                 status: { $in: ["PENDING", "ASSIGNED_TO_POLICE_STATION", "UNDER_INVESTIGATION"] },
//                 ...dateFilter 
//             })
//         ]);

//         const systemOverview = {
//             tenants: {
//                 total: totalTenants,
//                 active: activeTenants,
//                 inactive: totalTenants - activeTenants
//             },
//             users: {
//                 admins: {
//                     total: totalAdmins,
//                     active: activeAdmins,
//                     pending: totalAdmins - activeAdmins
//                 },
//                 police: {
//                     total: totalPolice,
//                     active: activePolice,
//                     pending: totalPolice - activePolice
//                 },
//                 citizens: {
//                     total: totalCitizens
//                 }
//             },
//             cases: {
//                 total: totalCases,
//                 resolved: resolvedCases,
//                 active: activeCases,
//                 resolutionRate: totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(2) : 0
//             }
//         };

//         res.status(200).json(
//             new apiResponse(200, systemOverview, "System overview fetched successfully")
//         );
//     });

//     static getTenantPerformanceController = wrapAsync(async (req, res) => {
//         const currentUser = req.user;

//         if (!currentUser.isSuperAdmin) {
//             throw new apiError(403, "Only SuperAdmin can access tenant performance data");
//         }

//         const { limit = 10, sortBy = "totalCases", order = -1 } = req.query;

//         const tenantPerformance = await Tenant.aggregate([
//             {
//                 $lookup: {
//                     from: "cases",
//                     localField: "_id",
//                     foreignField: "tenantId",
//                     as: "cases"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "tenantId",
//                     as: "users"
//                 }
//             },
//             {
//                 $project: {
//                     name: 1,
//                     code: 1,
//                     region: 1,
//                     isActive: 1,
//                     totalCases: { $size: "$cases" },
//                     resolvedCases: {
//                         $size: {
//                             $filter: {
//                                 input: "$cases",
//                                 cond: { $eq: ["$$this.status", "RESOLVED"] }
//                             }
//                         }
//                     },
//                     totalUsers: { $size: "$users" },
//                     activeAdmins: {
//                         $size: {
//                             $filter: {
//                                 input: "$users",
//                                 cond: { $eq: ["$$this.role", "ADMIN", "$this.status", "APPROVED"] }
//                             }
//                         }
//                     },
//                     activePolice: {
//                         $size: {
//                             $filter: {
//                                 input: "$users",
//                                 cond: { $eq: ["$$this.role", "POLICE", "$this.status", "APPROVED"] }
//                             }
//                         }
//                     }
//                 }
//             },
//             {
//                 $addFields: {
//                     resolutionRate: {
//                         $cond: {
//                             if: { $gt: ["$totalCases", 0] },
//                             then: { $multiply: [{ $divide: ["$resolvedCases", "$totalCases"] }, 100] },
//                             else: 0
//                         }
//                     },
//                     performanceScore: {
//                         $add: [
//                             { $multiply: ["$resolutionRate", 0.4] },
//                             { $multiply: [{ $divide: ["$activeAdmins", "$totalUsers"] }, 30] },
//                             { $multiply: [{ $divide: ["$activePolice", "$totalUsers"] }, 30] }
//                         ]
//                     }
//                 }
//             },
//             {
//                 $sort: { [sortBy]: parseInt(order) }
//             },
//             {
//                 $limit: parseInt(limit)
//             }
//         ]);

//         res.status(200).json(
//             new apiResponse(200, tenantPerformance, "Tenant performance data fetched successfully")
//         );
//     });

//     static getSystemUsageMetricsController = wrapAsync(async (req, res) => {
//         const currentUser = req.user;

//         if (!currentUser.isSuperAdmin) {
//             throw new apiError(403, "Only SuperAdmin can access system usage metrics");
//         }

//         const { period = "monthly", startDate, endDate } = req.query;

//         const dateFilter = {};
//         if (startDate || endDate) {
//             dateFilter.createdAt = {};
//             if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
//             if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
//         }

//         // Get system usage trends
//         const usageMetrics = await Promise.all([
//             // User registration trends
//             User.aggregate([
//                 {
//                     $match: { ...dateFilter },
//                     $group: {
//                         _id: {
//                             year: { $year: "$createdAt" },
//                             month: period === "monthly" ? { $month: "$createdAt" } : 
//                                    period === "weekly" ? { $week: "$createdAt" } :
//                                    { $dayOfMonth: "$createdAt" }
//                         },
//                         registrations: { $sum: 1 }
//                     },
//                     { $sort: { "_id": 1 } },
//                     { $limit: 12 }
//                 ]),
            
//             // Case creation trends
//             Case.aggregate([
//                 {
//                     $match: { ...dateFilter },
//                     $group: {
//                         _id: {
//                             year: { $year: "$createdAt" },
//                             month: period === "monthly" ? { $month: "$createdAt" } : 
//                                    period === "weekly" ? { $week: "$createdAt" } :
//                                    { $dayOfMonth: "$createdAt" }
//                         },
//                         cases: { $sum: 1 }
//                     },
//                     { $sort: { "_id": 1 } },
//                     { $limit: 12 }
//                 ]),

//             // API usage (from audit logs)
//             AuditLog.aggregate([
//                 {
//                     $match: { ...dateFilter },
//                     $group: {
//                         _id: {
//                             year: { $year: "$createdAt" },
//                             month: period === "monthly" ? { $month: "$createdAt" } : 
//                                    period === "weekly" ? { $week: "$createdAt" } :
//                                    { $dayOfMonth: "$createdAt" }
//                         },
//                         apiCalls: { $sum: 1 }
//                     },
//                     { $sort: { "_id": 1 } },
//                     { $limit: 12 }
//                 ])
//         ]);

//         const [
//             userTrends,
//             caseTrends,
//             apiTrends
//         ] = usageMetrics;

//         const metrics = {
//             period,
//             userRegistrations: userTrends,
//             caseCreations: caseTrends,
//             apiUsage: apiTrends,
//             summary: {
//                 totalRegistrations: userTrends.reduce((sum, item) => sum + item.registrations, 0),
//                 totalCases: caseTrends.reduce((sum, item) => sum + item.cases, 0),
//                 totalApiCalls: apiTrends.reduce((sum, item) => sum + item.apiCalls, 0)
//             }
//         };

//         res.status(200).json(
//             new apiResponse(200, metrics, "System usage metrics fetched successfully")
//         );
//     });

// }

// export default SystemAnalyticsController;
