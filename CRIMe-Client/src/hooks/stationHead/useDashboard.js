import { useQuery } from '@tanstack/react-query'
import { stationHeadService } from '../../services/stationHeadService'

export const useDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => stationHeadService.getDashboardStats(),
    staleTime: 1000 * 60,
  });

  return {
    stats: data ?? {},
    isLoading,
    error,
  };
}