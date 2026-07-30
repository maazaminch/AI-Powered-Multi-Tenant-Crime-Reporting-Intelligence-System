import { useQuery, useMutation } from '@tanstack/react-query'
import { stationHeadService } from '../../services/stationHeadService'
import { toast } from 'sonner'

export const useStationPolice = (
  page,
  selectedPoliceId
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['station-police', page],
    queryFn: () => stationHeadService.getStationPolice(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: policeDetails, isLoading: isDetailsLoading, error: isDetailsError } = useQuery({
    queryKey: ['police-details', selectedPoliceId],
    queryFn: () => stationHeadService.getPoliceDetails(selectedPoliceId),
    enabled: !!selectedPoliceId,
  })

  return {
    police: data?.police ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    policeDetails,
    isDetailsLoading,
    isDetailsError
  }
}


