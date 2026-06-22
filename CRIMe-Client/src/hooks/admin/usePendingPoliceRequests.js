import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '../../services/adminService'
import { usersService } from '../../services/usersService'
import { formatError } from '../../lib/utils'

export const usePendingPoliceRequests = (page) => {
  const queryClient = useQueryClient()

  const { data: pendingPolice, isLoading, error } = useQuery({
    queryKey: ['pending-police', page],
    queryFn: () => adminService.getPendingPolice(page),
  })

  const approvePoliceMutation = useMutation({
    mutationFn: (userId) => usersService.updateUserStatus(userId, 'APPROVED'),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-police'])
      toast.success('Police approved successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const rejectPoliceMutation = useMutation({
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
    pendingPolice: pendingPolice?.pendingPolice ?? [],
    pagination: pendingPolice?.pagination ?? {},
    isLoading,
    error,
    approvePolice: approvePoliceMutation,
    rejectPolice: rejectPoliceMutation,
  }
}

