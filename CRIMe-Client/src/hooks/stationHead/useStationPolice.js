import { useQuery, useMutation } from '@tanstack/react-query'
import stationHeadService from '../../services/stationHeadService'
import { toast } from 'sonner'

export const useStationPolice = (page = 1) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['station-police', page],
    queryFn: () => stationHeadService.getStationPolice(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    police: data?.police ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch
  }
}

export const usePoliceDetails = (policeId) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['police-details', policeId],
    queryFn: () => stationHeadService.getPoliceDetails(policeId),
    enabled: !!policeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    policeDetails: data,
    isLoading,
    error
  }
}
