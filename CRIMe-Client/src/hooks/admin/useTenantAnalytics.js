import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";

export const useTenantAnalytics = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["tenant-analytics"],
        queryFn: () => adminService.getTenantAnalytics(),
        staleTime: 1000 * 60,
    });

    return {
        analytics: data ?? {},
        isLoading,
        error,
    };
}
