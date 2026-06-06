import { useQuery } from "@tanstack/react-query";
import superAdminService from "../../services/superAdminService";


export const useSystemAnalytics = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["system-analytics"],
        queryFn: () => superAdminService.getSystemAnalytics(),
        staleTime: 1000 * 60,
    });

    return {
        analytics: data ?? {},
        isLoading,
        error,
    };
} 