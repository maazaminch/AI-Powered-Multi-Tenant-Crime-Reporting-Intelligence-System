import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '../../services/adminService'
import { usersService } from '../../services/usersService'
import { formatError } from '../../lib/utils'


export const usePoliceManagement = (page, status, q, stationId) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['police-management', page, status, q, stationId],
    queryFn: () => adminService.getAllPolice(page, status, q, stationId),
  })

  const statusMutation = useMutation({
    mutationFn: ({ userId, newStatus }) => usersService.updateUserStatus(userId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(['police-management'])
      toast.success('Police status updated')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId) => usersService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['police-management'])
      toast.success('Police deleted successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const assignMutation = useMutation({
    mutationFn: ({ policeId, stationId }) => adminService.assignPoliceToStation(policeId, stationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['police-management'])
      toast.success('Police assigned to station')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const transferMutation = useMutation({
    mutationFn: ({ policeId, toStationId }) => adminService.transferPolice(policeId, toStationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['police-management'])
      toast.success('Police transferred successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (inviteData) => (import('../../services/authService').then(m=>m.default)).then(svc => svc.createInviteLink(inviteData)),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-police'])
      toast.success('Police invite sent')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  return {
    police: data?.police ?? [],
    pagination: data?.pagination ?? {},
    isLoading,
    error,
    statusMutation,
    deleteMutation,
    assignMutation,
    transferMutation,
    inviteMutation
  }

}