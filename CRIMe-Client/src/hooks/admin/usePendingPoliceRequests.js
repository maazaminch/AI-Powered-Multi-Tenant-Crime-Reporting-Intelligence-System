import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '../../services/adminService'
import { usersService } from '../../services/usersService'
import { formatError } from '../../lib/utils'

export const usePendingPoliceRequests = (page) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['pending-police', page],
    queryFn: () => adminService.getPendingPolice(page),
  })

  const approveMutation = useMutation({
    mutationFn: (userId) => usersService.updateUserStatus(userId, 'APPROVED'),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-police'])
      toast.success('Police approved successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (userId) => usersService.updateUserStatus(userId, 'REJECTED'),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-police'])
      toast.success('Police request rejected')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  return {
    pendingPolice: data?.pendingPolice ?? [],
    pagination: data?.pagination ?? {},
    isLoading,
    error,
    approveMutation,
    rejectMutation,
  }
}

