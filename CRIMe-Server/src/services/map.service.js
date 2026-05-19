import Case from "../models/case.model.js";

class MapService {
    
    // Get all crime locations for heatmap
    static async getHeatmapData(tenantId = null) {
        try {
            const query = {
                location: { $exists: true },
                "location.coordinates": { $ne: null }
            };
            
            // If tenantId provided, filter by tenant
            if (tenantId) {
                query.tenantId = tenantId;
            }
            
            const reports = await Case.find(query)
                .select('location coordinates crimeType severity tenantId')
                .lean();
            
            return {
                success: true,
                data: reports.map(report => ({
                    coordinates: report.location.coordinates,
                    crimeType: report.crimeType,
                    severity: report.severity,
                    tenantId: report.tenantId
                })),
                total: reports.length
            };
            
        } catch (error) {
            console.error('Heatmap data error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}

export default MapService;
