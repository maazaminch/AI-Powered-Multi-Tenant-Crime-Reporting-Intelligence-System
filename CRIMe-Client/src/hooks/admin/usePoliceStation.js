import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {adminService} from '../../services/adminService'
import { formatError } from '../../lib/utils'


export const usePoliceStationManagement = (
  filters) => {
  
  
  const queryClient = useQueryClient()

  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['Stations', filters],
    queryFn: () => adminService.getStations(filters),
  })

  const createStationMutation = useMutation({
    mutationFn: adminService.createStation,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['Stations'] })
      toast.success(response?.message || 'Police station created successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const deleteStationMutation = useMutation({
    mutationFn: (stationId) => adminService.deleteStation(stationId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['Stations'] })
      toast.success(response?.message || 'Police station deleted successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const toggleStationMutation = useMutation({
    mutationFn: (stationId) =>
      adminService.activateOrDeactivateStation(stationId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['Stations'] })
      toast.success(response?.message || 'Station status updated')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })


  const assignOrChangeShoMutation = useMutation({
    mutationFn: ({ stationId, policeId }) => adminService.assignOrChangeSho({ stationId, policeId }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stationDetails', variables.stationId] })
      queryClient.invalidateQueries({ queryKey: ['Stations'] })
      toast.success(response?.message || 'Station head assigned/changed successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const removeShoMutation = useMutation({
    mutationFn: ({ stationId }) => adminService.removeSho(stationId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stationDetails', variables.stationId] })
      queryClient.invalidateQueries({ queryKey: ['Stations'] })
      toast.success(response?.message || 'Station head removed successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  return {
    stations: stations?.stations || [],
    totalStations: stations?.totalStations || 0,
    pagination: stations?.pagination || {},
    isLoading,
    error,
    createStation: createStationMutation,
    deleteStation: deleteStationMutation,
    toggleStation: toggleStationMutation,
    assignOrChangeSho: assignOrChangeShoMutation,
    removeSho: removeShoMutation,
  }
}
