import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import superAdminService from '../../services/superAdminService'

export const useDashboardStats = () => {
  
    const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => superAdminService.dashboardStats(),
    staleTime: 1000 * 60,
  });

  return {
    stats: data ?? {},
    isLoading,
    error,
}

};