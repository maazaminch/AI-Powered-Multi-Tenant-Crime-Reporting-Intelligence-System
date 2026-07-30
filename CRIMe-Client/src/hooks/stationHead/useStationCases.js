import { useQuery } from '@tanstack/react-query'
import { stationHeadService } from '../../services/stationHeadService'

export const useStationCases = (filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['station-cases', filters],
    queryFn: () => stationHeadService.getStationCases(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    cases: data?.cases ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch
  }
}
