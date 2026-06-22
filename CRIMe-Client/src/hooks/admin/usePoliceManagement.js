import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '../../services/adminService'
import { usersService } from '../../services/usersService'
import { formatError } from '../../lib/utils'


export const usePoliceManagement = (
  page,
  status, 
  q, 
  stationId,
  selectPoliceId) => {
  const queryClient = useQueryClient()

  const { data: police, isLoading, error } = useQuery({
    queryKey: ['police-management', page, status, q, stationId],
    queryFn: () => adminService.getAllPolice(page, status, q, stationId),
  })

  const { data: policeDetails, isLoading: isPoliceDetailsLoading } = useQuery({
    queryKey: ['police-details', selectPoliceId],
    queryFn: () => adminService.getPoliceDetails(selectPoliceId),
    enabled: !!selectPoliceId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, newStatus }) => usersService.updateUserStatus(userId, newStatus),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['police-management'])
      toast.success(response?.message || 'Police status updated')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const deletePoliceMutation = useMutation({
    mutationFn: (userId) => usersService.deleteUser(userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['police-management'])
      toast.success(response?.message || 'Police deleted successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const assignPoliceMutation = useMutation({
    mutationFn: ({ policeId, stationId }) => adminService.assignPoliceToStation(policeId, stationId),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['police-management'])
      toast.success(response?.message || 'Police assigned to station')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const transferPoliceMutation = useMutation({
    mutationFn: ({ policeId, toStationId }) => adminService.transferPolice(policeId, toStationId),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['police-management'])
      toast.success(response?.message || 'Police transferred successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const invitePoliceMutation = useMutation({
    mutationFn: (inviteData) => (import('../../services/authService').then(m=>m.default)).then(svc => svc.createInviteLink(inviteData)),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['pending-police'])
      toast.success(response?.message || 'Police invite sent')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const { data: stations } = useQuery({
    queryKey: ['police-stations'],
    queryFn: () => adminService.getStations(),
  })

  const policeStations = stations?.stations?.filter((station) => station.isActive) ?? []
  return {
    isLoading,
    error,
    police: police?.police ?? [],
    policeStations,
    pagination: police?.pagination ?? {},
    policeDetails,
    isPoliceDetailsLoading,
    updateStatus: updateStatusMutation,
    deletePolice: deletePoliceMutation,
    assignPolice: assignPoliceMutation,
    transferPolice: transferPoliceMutation,
    invitePolice: invitePoliceMutation
  }

}