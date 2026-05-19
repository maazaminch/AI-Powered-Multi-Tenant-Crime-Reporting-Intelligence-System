import CrimeReport from "../models/crimeReport.model.js";

class HeatmapService {
    
    // Get crime data for heatmap visualization
    static async getHeatmapData(tenantId, filters = {}) {
        try {
            const {
                startDate,
                endDate,
                crimeTypes,
                severity,
                radius = 0.01 // ~1km radius
            } = filters;
            
            // Build query
            const query = {
                tenantId,
                location: { $exists: true },
                "location.coordinates": { $ne: null }
            };
            
            // Date range filter
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }
            
            // Crime type filter
            if (crimeTypes && crimeTypes.length > 0) {
                query.crimeType = { $in: crimeTypes };
            }
            
            // Severity filter
            if (severity && severity.length > 0) {
                query.severity = { $in: severity };
            }
            
            // Get crime reports with location data
            const reports = await CrimeReport.find(query)
                .select('location coordinates crimeType severity createdAt')
                .lean();
            
            // Group crimes by geographic clusters
            const heatmapPoints = this.clusterCrimes(reports, radius);
            
            return {
                success: true,
                data: heatmapPoints,
                totalCrimes: reports.length,
                filters: filters
            };
            
        } catch (error) {
            console.error('Heatmap data generation error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
    
    // Cluster nearby crimes for better heatmap visualization
    static clusterCrimes(reports, radius) {
        const clusters = [];
        const processed = new Set();
        
        reports.forEach((report, index) => {
            if (processed.has(index)) return;
            
            const [longitude, latitude] = report.location.coordinates;
            const cluster = {
                center: [longitude, latitude],
                weight: 1,
                crimes: [{
                    type: report.crimeType,
                    severity: report.severity,
                    date: report.createdAt
                }],
                radius: radius
            };
            
            // Find nearby crimes
            reports.forEach((otherReport, otherIndex) => {
                if (index === otherIndex || processed.has(otherIndex)) return;
                
                const [otherLon, otherLat] = otherReport.location.coordinates;
                const distance = this.calculateDistance(
                    latitude, longitude, otherLat, otherLon
                );
                
                if (distance <= radius) {
                    cluster.weight++;
                    cluster.crimes.push({
                        type: otherReport.crimeType,
                        severity: otherReport.severity,
                        date: otherReport.createdAt
                    });
                    processed.add(otherIndex);
                }
            });
            
            processed.add(index);
            clusters.push(cluster);
        });
        
        return clusters;
    }
    
    // Calculate distance between two coordinates (in km)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Get crime statistics by area
    static async getCrimeStatsByArea(tenantId, areaBounds) {
        try {
            const { north, south, east, west } = areaBounds;
            
            const stats = await CrimeReport.aggregate([
                {
                    $match: {
                        tenantId,
                        location: {
                            $geoWithin: {
                                $box: [
                                    [west, south], // Southwest corner
                                    [east, north]  // Northeast corner
                                ]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            crimeType: "$crimeType",
                            severity: "$severity"
                        },
                        count: { $sum: 1 },
                        latestDate: { $max: "$createdAt" }
                    }
                },
                {
                    $group: {
                        _id: "$_id.crimeType",
                        severities: {
                            $push: {
                                severity: "$_id.severity",
                                count: "$count"
                            }
                        },
                        total: { $sum: "$count" },
                        latestDate: { $max: "$latestDate" }
                    }
                },
                {
                    $sort: { total: -1 }
                }
            ]);
            
            return {
                success: true,
                data: stats,
                totalCrimeTypes: stats.length
            };
            
        } catch (error) {
            console.error('Crime stats error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
    
    // Get hotspot areas (high crime density)
    static async getHotspots(tenantId, threshold = 5) {
        try {
            const heatmapData = await this.getHeatmapData(tenantId);
            
            if (!heatmapData.success) {
                return heatmapData;
            }
            
            // Filter areas with crime count above threshold
            const hotspots = heatmapData.data
                .filter(cluster => cluster.weight >= threshold)
                .sort((a, b) => b.weight - a.weight);
            
            return {
                success: true,
                data: hotspots,
                totalHotspots: hotspots.length,
                threshold
            };
            
        } catch (error) {
            console.error('Hotspot detection error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}

export default HeatmapService;
