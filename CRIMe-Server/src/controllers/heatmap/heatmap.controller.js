import wrapAsync from "../../utils/wrapAsync.js";
import apiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import HeatmapService from "../../services/heatmap.service.js";

class HeatmapController {

    static getHeatmapData = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        // Only admins and super admins can access heatmap data
        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const {
            startDate,
            endDate,
            crimeTypes,
            severity,
            radius,
            tenantId
        } = req.query;

        // Determine target tenant
        let targetTenantId = null;
        
        if (currentUser.isSuperAdmin) {
            // SuperAdmin can see all data or specific tenant
            targetTenantId = tenantId || null; // null = all tenants
        } else {
            // Other users can only see their own tenant data
            targetTenantId = currentUser.tenantId;
        }

        const filters = {
            startDate,
            endDate,
            crimeTypes: crimeTypes ? crimeTypes.split(',') : undefined,
            severity: severity ? severity.split(',') : undefined,
            radius: radius ? parseFloat(radius) : 0.01
        };

        const result = await HeatmapService.getHeatmapData(targetTenantId, filters);

        res.status(200).json(
            new apiResponse(200, result, "Heatmap data fetched successfully")
        );
    });

    static getHotspots = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        // Only admins and super admins can access hotspot data
        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const { 
            threshold = 5, 
            tenantId,
            startDate,
            endDate,
            crimeTypes,
            severity
        } = req.query;

        // Determine target tenant
        let targetTenantId = null;
        
        if (currentUser.isSuperAdmin) {
            targetTenantId = tenantId || null;
        } else {
            targetTenantId = currentUser.tenantId;
        }

        const filters = {
            startDate,
            endDate,
            crimeTypes: crimeTypes ? crimeTypes.split(',') : undefined,
            severity: severity ? severity.split(',') : undefined
        };

        const result = await HeatmapService.getHotspots(targetTenantId, parseInt(threshold), filters);

        res.status(200).json(
            new apiResponse(200, result, "Hotspot data fetched successfully")
        );
    });

    static getCrimeStatsByArea = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        // Only admins and super admins can access area statistics
        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const {
            north,
            south,
            east,
            west,
            tenantId
        } = req.query;

        // Validate bounds
        if (!north || !south || !east || !west) {
            throw new apiError(400, "Area bounds (north, south, east, west) are required");
        }

        // Determine target tenant
        let targetTenantId = null;
        
        if (currentUser.isSuperAdmin) {
            targetTenantId = tenantId || null;
        } else {
            targetTenantId = currentUser.tenantId;
        }

        const areaBounds = {
            north: parseFloat(north),
            south: parseFloat(south),
            east: parseFloat(east),
            west: parseFloat(west)
        };

        const result = await HeatmapService.getCrimeStatsByArea(targetTenantId, areaBounds);

        res.status(200).json(
            new apiResponse(200, result, "Crime statistics by area fetched successfully")
        );
    });

    static getCrimeTrends = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        // Only admins and super admins can access trend data
        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const {
            startDate,
            endDate,
            period = 'daily', // daily, weekly, monthly
            tenantId,
            crimeTypes,
            severity
        } = req.query;

        const validPeriods = ['daily', 'weekly', 'monthly'];
        if (!validPeriods.includes(period)) {
            throw new apiError(400, "Invalid period. Must be daily, weekly, or monthly");
        }

        // Determine target tenant
        let targetTenantId = null;
        
        if (currentUser.isSuperAdmin) {
            targetTenantId = tenantId || null;
        } else {
            targetTenantId = currentUser.tenantId;
        }

        const filters = {
            startDate,
            endDate,
            crimeTypes: crimeTypes ? crimeTypes.split(',') : undefined,
            severity: severity ? severity.split(',') : undefined
        };

        const result = await HeatmapService.getCrimeTrends(targetTenantId, period, filters);

        res.status(200).json(
            new apiResponse(200, result, "Crime trends fetched successfully")
        );
    });

    static getHeatmapAnalytics = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        // Only admins and super admins can access analytics
        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const {
            tenantId,
            startDate,
            endDate
        } = req.query;

        // Determine target tenant
        let targetTenantId = null;
        
        if (currentUser.isSuperAdmin) {
            targetTenantId = tenantId || null;
        } else {
            targetTenantId = currentUser.tenantId;
        }

        const filters = {
            startDate,
            endDate
        };

        const result = await HeatmapService.getHeatmapAnalytics(targetTenantId, filters);

        res.status(200).json(
            new apiResponse(200, result, "Heatmap analytics fetched successfully")
        );
    });

    static exportHeatmapData = wrapAsync(async (req, res) => {
        const currentUser = req.user;

        // Only admins and super admins can export data
        if (currentUser.role !== "ADMIN" && !currentUser.isSuperAdmin) {
            throw new apiError(403, "Access denied");
        }

        const {
            format = 'json', // json, csv
            startDate,
            endDate,
            crimeTypes,
            severity,
            tenantId
        } = req.query;

        const validFormats = ['json', 'csv'];
        if (!validFormats.includes(format)) {
            throw new apiError(400, "Invalid format. Must be json or csv");
        }

        // Determine target tenant
        let targetTenantId = null;
        
        if (currentUser.isSuperAdmin) {
            targetTenantId = tenantId || null;
        } else {
            targetTenantId = currentUser.tenantId;
        }

        const filters = {
            startDate,
            endDate,
            crimeTypes: crimeTypes ? crimeTypes.split(',') : undefined,
            severity: severity ? severity.split(',') : undefined
        };

        const result = await HeatmapService.getHeatmapData(targetTenantId, filters);

        if (format === 'csv') {
            // Set CSV headers
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=heatmap_data.csv');
            
            // Convert to CSV and send
            const csvData = HeatmapService.convertToCSV(result.data);
            res.send(csvData);
        } else {
            // Send JSON response
            res.status(200).json(
                new apiResponse(200, result, "Heatmap data exported successfully")
            );
        }
    });
}

export default HeatmapController;
