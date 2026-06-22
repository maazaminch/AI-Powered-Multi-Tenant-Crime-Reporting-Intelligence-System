import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";

export const useAdminAnalytics = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: () => adminService.getTenantAnalytics(),
        staleTime: 1000 * 60,
    });

    return {
        analytics: data ?? {},
        isLoading,
        error,
    };
}
