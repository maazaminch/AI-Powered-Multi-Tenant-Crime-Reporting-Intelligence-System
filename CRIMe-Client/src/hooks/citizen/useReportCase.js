import { useMutation } from '@tanstack/react-query'
import { citizenService } from '../../services/citizenService'
import { toast } from 'sonner'

export const useReportCase = () => {
  return useMutation({
    mutationFn: (caseData) => citizenService.reportCase(caseData),
    onSuccess: (data) => {
      toast.success('Case reported successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to report case')
      throw error
    }
  })
}

export const useSuggestNearestStations = () => {
  return useMutation({
    mutationFn: (location) => citizenService.suggestNearestStations(location),
    onError: (error) => {
      toast.error('Failed to fetch nearby stations')
      throw error
    }
  })
}
