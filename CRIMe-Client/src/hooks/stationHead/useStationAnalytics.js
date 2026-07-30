import { useQuery } from "@tanstack/react-query";
import { stationHeadService } from "../../services/stationHeadService";

export const useStationAnalytics = (params = {}) => {
    const query = useQuery({
        queryKey: ["station-analytics", params],
        queryFn: () => stationHeadService.stationAnalytics(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    return {
        analytics: query.data ?? {},
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
};