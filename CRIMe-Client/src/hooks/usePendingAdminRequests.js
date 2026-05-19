import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import superAdminService from '../services/superAdminService'
import usersService from '../services/usersService'
import { formatError } from '../lib/utils'

export const usePendingAdminRequests = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['superadmin-pending-admins'],
    queryFn: () => superAdminService.getPendingAdmins(),
  })

  const approveMutation = useMutation({
    mutationFn: (userId) => usersService.updateUserStatus(userId, 'APPROVED'),
    onSuccess: () => {
      queryClient.invalidateQueries(['superadmin-pending-admins'])
      toast.success('Admin approved successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (userId) => usersService.updateUserStatus(userId, 'REJECTED'),
    onSuccess: () => {
      queryClient.invalidateQueries(['superadmin-pending-admins'])
      toast.success('Admin request rejected')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  return {
    pendingAdmins: data ?? [],
    isLoading,
    error,
    approveMutation,
    rejectMutation,
  }
}

export default usePendingAdminRequests
