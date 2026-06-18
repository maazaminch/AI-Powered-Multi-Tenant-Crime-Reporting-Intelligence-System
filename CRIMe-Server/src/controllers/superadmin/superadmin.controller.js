import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import User from "../../models/user.model.js";
import Tenant from "../../models/tenant.model.js";
import Case from "../../models/case.model.js";
import escapeRegex from "../../utils/escapeRegex.js";
import NotificationService from "../../services/notification.service.js";

class SuperAdminController {

    // Admin Management
    static getPendingAdmins = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can access this endpoint");
        }

        const pendingAdmins = await User.find({
            role: "ADMIN",
            status: "PENDING"
        })
            .select("-password")
            .populate('tenantId', 'name code')
            .sort({ createdAt: -1 });

        res.status(200).json(
            new apiResponse(200, pendingAdmins, "Pending admin requests fetched successfully")
        );
    });

    static getAdminDetailsController = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const adminId = req.params.adminId;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can access this endpoint");
        }

        const admin = await User.findById(adminId)
            .select("-password")
            .populate('tenantId', 'name code');

        if (!admin || admin.role !== "ADMIN") {
            throw new apiError(404, "Admin not found");
        }

        res.status(200).json(
            new apiResponse(200, admin, "Admin details fetched successfully")
        );
    });

    static getAllAdminsController = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const status = req.query.status

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can access all admins");
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {
            role: "ADMIN",
            isSuperAdmin: false
        };
        if (status) {
            filter.status = status;
        }

        const totalAdmins = await User.countDocuments(filter);

        const admins = await User.find(filter)
            .select("-password")
            .populate('tenantId', 'name code')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalAdmins / limit);

        return res.status(200).json(
            new apiResponse(
                200,
                {
                    admins,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalAdmins,
                        limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                    }
                },
                "All admins retrieved successfully"
            )
        );
    }); 

    static assignAdminToTenantController = wrapAsync(async (req, res) => {
        const adminId = req.params.adminId;
        const { tenantId } = req.body;
        const currentUser = req.user;

        if(!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can assign admin to tenant");
        }

        const admin = await User.findById(adminId);
        if (!admin) throw new apiError(404, "Admin not found");

        if (admin.role !== "ADMIN") {
            throw new apiError(400, "Only ADMIN role allowed");
        }
        
        if (admin.tenantId) {
            throw new apiError(400, "Admin already has tenant. Use transfer");
        }

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new apiError(404, "Tenant not found");

        if (!tenant.isActive) {
            throw new apiError(400, "Tenant not active");
        }

        admin.tenantId = tenantId;
        await admin.save();

        await NotificationService.send({
            tenantId,
            userId: adminId,
            type: "ADMIN_ASSIGNED",
            title: "Tenant Assignment",
            message: `You have been assigned to ${tenant.name} tenant`,
            channels: ["inapp"]
        });

        res.status(200).json(
            new apiResponse(200, 
                { adminId: admin._id, tenantId },
                "Admin assigned to tenant successfully")
        );
    });

    static transferAdminController = wrapAsync(async (req, res) => {
        
        const adminId = req.params.adminId;
        const { newTenantId } = req.body;
        const currentUser = req.user;

        if(!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can transfer admin to tenant");
        }

        const admin = await User.findById(adminId);
        if (!admin) throw new apiError(404, "Admin not found");
        
        if (admin.role !== "ADMIN") {
            throw new apiError(400, "Only ADMIN role allowed");
        }

        if(admin.tenantId.toString() === newTenantId) {
            throw new apiError(400, "Admin already in this tenant");
        }

        const newTenant = await Tenant.findById(newTenantId);
        if (!newTenant) throw new apiError(404, "New tenant not found");

        if (!newTenant.isActive) {
            throw new apiError(400, "New tenant not active");
        }

        admin.tenantId = newTenantId;
        await admin.save();

        await NotificationService.send({
            tenantId: newTenantId,
            userId: adminId,
            type: "ADMIN_TRANSFERRED",
            title: "Tenant Transfer",
            message: `You have been transferred to ${newTenant.name} tenant`,
            channels: ["inapp"]
        });

        res.status(200).json(
            new apiResponse(200, 
                { adminId: admin._id, newTenantId },
                "Admin transferred to new tenant successfully")
        );
    });


    static getAdminPerformanceController = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can access admin performance data");
        }

        const { adminId, startDate, endDate } = req.query;

        // Validate admin exists
        const admin = await User.findById(adminId);
        if (!admin) {
            throw new apiError(404, "Admin not found");
        }

        if (admin.role !== "ADMIN") {
            throw new apiError(400, "User is not an admin");
        }

        // Get performance metrics
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const [
            totalCases,
            resolvedCases,
            pendingPolice,
            activePolice,
            totalStations
        ] = await Promise.all([
            Case.countDocuments({
                tenantId: admin.tenantId,
                ...dateFilter
            }),
            Case.countDocuments({
                tenantId: admin.tenantId,
                status: "RESOLVED",
                ...dateFilter
            }),
            User.countDocuments({
                tenantId: admin.tenantId,
                role: "POLICE",
                status: "PENDING",
                ...dateFilter
            }),
            User.countDocuments({
                tenantId: admin.tenantId,
                role: "POLICE",
                status: "APPROVED",
                ...dateFilter
            }),
            PoliceStation.countDocuments({
                tenantId: admin.tenantId,
                ...dateFilter
            })
        ]);

        const performance = {
            adminId: admin._id,
            adminName: admin.fullName,
            tenantId: admin.tenantId,
            totalCases,
            resolvedCases,
            pendingPolice,
            activePolice,
            totalStations,
            resolutionRate: totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(2) : 0
        };

        res.status(200).json(
            new apiResponse(200, performance, "Admin performance fetched successfully")
        );
    });

    static dashboardStatsController = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can access dashboard statistics");
        }

        const [
            totalTenants,
            approvedAdmins,
            pendingAdmins,
            totalCases ] = await Promise.all([
                Tenant.countDocuments({}),
                User.countDocuments({ role: "ADMIN", status: "APPROVED" , isSuperAdmin: false }),
                User.countDocuments({ role: "ADMIN", status: "PENDING" }),
                Case.countDocuments({})
            ]);

        res.status(200).json(
            new apiResponse(200, 
                {
                totalTenants,
                approvedAdmins,
                pendingAdmins,
                totalCases
                },
                 "Dashboard statistics fetched successfully")
        );
    });

    static getSystemAnalyticsController = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can access system analytics");
        }

        const [
            totalTenants,
            activeTenants,
            DeActiveTenants,

            totalUsers,
            totalAdmins,
            totalPolice,
            totalCitizens,

            totalCases,
            pendingCases,
            assignedCases,
            underInvestigationCases,
            resolvedCases,
            closedCases,

            casesPerTenant,
            topActiveTenants,
            newUsersThisMonth,
            newCasesThisMonth
            
        ] = await Promise.all([
            Tenant.countDocuments({}),
            Tenant.countDocuments({ isActive: true }),
            Tenant.countDocuments({ isActive: false }),

            User.countDocuments({isSuperAdmin: false}),
            User.countDocuments({ role: "ADMIN", isSuperAdmin: false }),
            User.countDocuments({ role: "POLICE" }),
            User.countDocuments({ role: "CITIZEN" }),

            Case.countDocuments({}),
            Case.countDocuments({ status: "PENDING" }),
            Case.countDocuments({ status: "ASSIGNED" }),
            Case.countDocuments({ status: "UNDER_INVESTIGATION" }),
            Case.countDocuments({ status: "RESOLVED" }),
            Case.countDocuments({ status: "CLOSED" }),

            Case.aggregate([
                {
                    $group: {
                    _id: "$tenantId",
                    caseCount: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                    from: "tenants",
                    let: { tenantId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$tenantId"] } } },
                        { $project: { name: 1 } }
                    ],
                    as: "tenant"
                    }
                },
                { $unwind: "$tenant" },
                {
                    $project: {
                    tenantId: "$_id",
                    tenantName: "$tenant.name",
                    caseCount: 1
                    }
                }
                ]),

            Tenant.aggregate([
                {
                    $lookup: {
                    from: "cases",
                    let: { tenantId: "$_id" },
                    pipeline: [
                        {
                        $match: {
                            $expr: { $eq: ["$tenantId", "$$tenantId"] }
                        }
                        },
                        {
                        $count: "caseCount"
                        }
                    ],
                    as: "caseData"
                    }
                },
                {
                    $addFields: {
                    caseCount: {
                        $ifNull: [
                        { $arrayElemAt: ["$caseData.caseCount", 0] },
                        0
                        ]
                    }
                    }
                },
                { $sort: { caseCount: -1 } },
                { $limit: 5 },
                {
                    $project: {
                    tenantId: "$_id",
                    tenantName: "$name",
                    caseCount: 1
                    }
                }
                ]),

            User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } }),
            Case.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } })
        ]);

        const systemAnalytics = {
            tenants: {
                total: totalTenants,
                active: activeTenants,
                deActive: DeActiveTenants
            },
            users: {
                total: totalUsers,
                admins: totalAdmins,
                police: totalPolice,
                citizens: totalCitizens
            },
            cases: {
                total: totalCases,
                pending: pendingCases,
                assigned: assignedCases,
                underInvestigation: underInvestigationCases,
                resolved: resolvedCases,
                closed: closedCases
            },
            performance: {
            casesPerTenant,
            topActiveTenants
            },
            trends: {
            newUsersThisMonth,
            newCasesThisMonth
            }
        };

        res.status(200).json(
            new apiResponse(200, systemAnalytics, "System-wide statistics fetched successfully")
        );
    });

    // Tenant Management
    static createTenantController = wrapAsync(async(req, res) => {
            const {name, region, type} = req.body;
            const currentUser = req.user;
    
            if(!currentUser.isSuperAdmin) 
            throw new apiError(403, 'Not allowed to create tenant')
    
            if(!name || !region || !type) throw new apiError(400, 'Name, region and type are required')
    
            const existTenant = await Tenant.findOne({name})
            if(existTenant) throw new apiError(400, 'Tenant already exists')
    
            const tenant = await Tenant.create({
                name,
                region,
                type,
                isActive: true,
                createdBy: currentUser._id
            })
    
            const createdTenant = await Tenant.findById(tenant._id)
            if(!createdTenant) 
                {throw new apiError(400, 'Tenant not created')
                } else {
                    const superAdmin = await User.findOne({isSuperAdmin: true})
                    if(superAdmin){
                    await NotificationService.send({
                    tenantId: createdTenant._id,
                    userId: superAdmin._id,
                    type: 'Tenant Creation',
                    title: 'New Tenant Created',
                    message: `${name} tenant has been created`,
                    channels: ['inapp', 
                        //'email'
                        ]
                    })
                }
    
            return res.status(200).json(new apiResponse(200, tenant, 'Tenant created successfully'))
            }
        })
    
    static deleteTenantController = wrapAsync(async(req, res) =>{
            const tenantId = req.params.id;
            const currentUser = req.user;
    
            if(!currentUser.isSuperAdmin) throw new apiError(403, 'Not allowed to delete tenant')
    
            const deletedTenant = await Tenant.findByIdAndDelete(tenantId)
            if(!deletedTenant) {
                throw new apiError(400, 'Tenant not deleted')
            } else {
             const superAdmin = await User.findOne({isSuperAdmin: true}) 
             if(superAdmin){
                    await NotificationService.send({
                    tenantId: deletedTenant._id,
                    userId: superAdmin._id,
                    type: 'Tenant Deletion',
                    title: 'Tenant Deleted',
                    message: `${deletedTenant.name} tenant has been deleted`,
                    channels: ['inapp', 
                        //'email'
                        ]
                    })
             }  
            }
    
            return res.status(200).json(new apiResponse(200, deletedTenant, 'Tenant deleted successfully'));
        })
    
    static activateOrDeactivateTenantController = wrapAsync(async(req, res) => {
            const tenantId = req.params.id;
            const currentUser = req.user;
    
            if(!currentUser.isSuperAdmin) throw new apiError(403, 'Not allowed to activate or deactivate tenant')
    
            const tenant = await Tenant.findById(tenantId)
            if(!tenant) throw new apiError(400, 'Tenant not found')
    
            // 3️⃣ Toggle tenant status
            tenant.isActive = !tenant.isActive;
            await tenant.save();
    
            return res.status(200).json(
                new apiResponse(200, 
                    { id: tenant._id, isActive: tenant.isActive }, 
                    `Tenant ${tenant.isActive ? "activated" : "deactivated"} successfully`))
           
        })

    static getAllTenantsController = wrapAsync(async (req, res) => {

        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(
                403,
                "Only SuperAdmin can access all tenants"
            );
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalTenants = await Tenant.countDocuments();

        const tenants = await Tenant.find({})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalTenants / limit);

        return res.status(200).json(
            new apiResponse(
                200,
                {
                    tenants,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalTenants,
                        limit
                    }
                },
                "All tenants retrieved successfully"
            )
        );
    }); 

    // Tenant search (super admin only) — by name or code
    static searchTenantsController = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can search tenants");
        }

        let { q = "", page = 1, limit = 10 } = req.query;
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const filter = {};
        if (q && q.trim().length > 0) {
            const safeQuery = escapeRegex(q.trim());
            filter.$or = [
                { name: { $regex: safeQuery, $options: "i" } },
                { code: { $regex: safeQuery, $options: "i" } }
            ];
        }

        const [tenants, total] = await Promise.all([
            Tenant.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Tenant.countDocuments(filter)
        ]);

        return res.status(200).json(
            new apiResponse(200, {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                results: tenants
            }, "Tenants fetched successfully")
        );
    });

    static getTenantDetails = wrapAsync(async (req, res) => {
        const tenantId = req.params.id;
        const currentUser = req.user;

        if (!currentUser.isSuperAdmin) {
            throw new apiError(403, "Only SuperAdmin can access tenant details");
        }

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            throw new apiError(404, "Tenant not found");
        }

        res.status(200).json(
            new apiResponse(200, tenant, "Tenant details fetched successfully")
        );
    });
    
    static getTenantAnalyticsController = wrapAsync(async (req, res) => {
            const currentUser = req.user;
    
            if (!currentUser.isSuperAdmin) {
                throw new apiError(403, "Only SuperAdmin can access tenant analytics");
            }
    
            const { limit = 10, sortBy = "totalCases", order = -1 } = req.query;
    
            const topTenants = await Tenant.aggregate([
                {
                    $match: {
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: "cases",
                        localField: "_id",
                        foreignField: "tenantId",
                        as: "cases"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "tenantId",
                        as: "users"
                    }
                },
                {
                    $project: {
                        name: 1,
                        code: 1,
                        region: 1,
                        totalCases: { $size: "$cases" },
                        resolvedCases: {
                            $size: {
                                $filter: {
                                    input: "$cases",
                                    cond: { $eq: ["$$this.status", "RESOLVED"] }
                                }
                            }
                        },
                        totalUsers: { $size: "$users" },
                        activeAdmins: {
                            $size: {
                                $filter: {
                                    input: "$users",
                                    cond: { $eq: ["$$this.role", "ADMIN", "$this.status", "APPROVED"] }
                                }
                            }
                        },
                        activePolice: {
                            $size: {
                                $filter: {
                                    input: "$users",
                                    cond: { $eq: ["$$this.role", "POLICE", "$this.status", "APPROVED"] }
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        resolutionRate: {
                            $cond: {
                                if: { $gt: ["$totalCases", 0] },
                                then: { $multiply: [{ $divide: ["$resolvedCases", "$totalCases"] }, 100] },
                                else: 0
                            }
                        }
                    }
                },
                {
                    $sort: { [sortBy]: parseInt(order) }
                },
                {
                    $limit: parseInt(limit)
                }
            ]);
    
            res.status(200).json(
                new apiResponse(200, topTenants, "Tenant analytics fetched successfully")
            );
        });
    





}

export default SuperAdminController;
