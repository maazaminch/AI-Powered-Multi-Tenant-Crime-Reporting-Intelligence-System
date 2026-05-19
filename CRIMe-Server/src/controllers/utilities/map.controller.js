import wrapAsync from "../utils/wrapAsync.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import MapService from "../services/map.service.js";

class MapController {
    
    // Get heatmap data - works for all user types
    static getHeatmapData = wrapAsync(async (req, res) => {
        const currentUser = req.user;
        const { tenantId } = req.query;
        
        let targetTenantId = null;
        
        // SuperAdmin can see all data or specific tenant
        if (currentUser.isSuperAdmin) {
            targetTenantId = tenantId || null; // null = all tenants
        } 
        // Other users can only see their own tenant data
        else {
            targetTenantId = currentUser.tenantId;
        }
        
        const result = await MapService.getHeatmapData(targetTenantId);
        
        if (!result.success) {
            throw new apiError(500, result.error);
        }
        
        return res.status(200).json(
            new apiResponse(200, result, "Heatmap data retrieved successfully")
        );
    });
}

export default MapController;
