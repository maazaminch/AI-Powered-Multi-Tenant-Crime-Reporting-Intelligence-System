import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {adminService} from '../../services/adminService'
import { formatError } from '../../lib/utils'
import { useState } from 'react'

export const usePoliceStationManagement = (page) => {
  const queryClient = useQueryClient()
  const [selectedStationId, setSelectedStationId] = useState(null)

  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['Stations', page],
    queryFn: () => adminService.getStations(page),
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
    mutationFn: adminService.deleteStation,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['Stations'] })
      toast.success(response?.message || 'Police station deleted successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const toggleStationMutation = useMutation({
    mutationFn: ({ stationId }) =>
      adminService.activateOrDeactivateStation(stationId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['Stations'] })
      toast.success(response?.message || 'Station status updated')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const { data: stationDetails, isLoading: isStationDetailsLoading } = useQuery({
    queryKey: ['stationDetails', selectedStationId],
    queryFn: () => adminService.getStationDetails(selectedStationId),
    enabled: !!selectedStationId,
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
    pagination: stations?.pagination || {},
    isLoading,
    error,
    createStation: createStationMutation,
    deleteStation: deleteStationMutation,
    toggleStation: toggleStationMutation,
    stationDetails,
    isStationDetailsLoading,
    selectedStationId,
    setSelectedStationId,
    assignOrChangeSho: assignOrChangeShoMutation,
    removeSho: removeShoMutation,
  }
}
