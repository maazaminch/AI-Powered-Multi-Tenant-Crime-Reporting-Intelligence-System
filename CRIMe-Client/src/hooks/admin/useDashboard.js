import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";


export const useDashboardStats = () => {

    const { data: dashboardStats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => adminService.dashboardStats(),
    staleTime: 1000 * 60,
  });

  return {
    dashboardStats: dashboardStats ?? {},
    isLoading,
    error,
}

}