import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import superAdminService from '../../services/superAdminService'
import usersService from '../../services/usersService'
import authService from '../../services/authService'
import { formatError } from '../../lib/utils'

export const useAdminsManagement = (
    selectedAdminId,
    page,
    status,
) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['superadmin-admins', page, status],
    queryFn: () => superAdminService.getAllAdmins({ page, status }),
  })

  const { data: tenantsData } = useQuery({
    queryKey: ['superadmin-tenants'],
    queryFn: () => superAdminService.getTenants(1),
  })

  const { data: adminDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['admin-details', selectedAdminId],
    queryFn: () => superAdminService.getAdminDetails(selectedAdminId),
    enabled: !!selectedAdminId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ userId, newStatus }) => usersService.updateUserStatus(userId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(['superadmin-admins'])
      toast.success('Admin status updated')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId) => usersService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['superadmin-admins'])
      queryClient.invalidateQueries(['superadmin-pending-admins'])
      toast.success('Admin deleted successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const assignMutation = useMutation({
    mutationFn: ({adminId, tenantId}) => superAdminService.assignAdminToTenant(adminId, tenantId),
    onSuccess: ()=> {
      queryClient.invalidateQueries(['superadmin-admins'])
      toast.success('Admin assigned to tenant successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    }
  })

    const transferMutation = useMutation({
    mutationFn: ({adminId, tenantId}) => superAdminService.transferAdmin(adminId, tenantId),
    onSuccess: ()=> {
      queryClient.invalidateQueries(['superadmin-admins'])
      toast.success('Admin transferred to new tenant successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    }
  })

  const inviteMutation = useMutation({
    mutationFn: (inviteData) => authService.createInviteLink(inviteData),
    onSuccess: () => {
      queryClient.invalidateQueries(['superadmin-pending-admins'])
      toast.success('Admin invite sent successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const admins = data?.admins ?? []
  const tenants = tenantsData?.tenants?.filter((tenant) => tenant.isActive) ?? []

  return {
    admins,
    tenants,
    pagination: data?.pagination,
    isLoading,
    error,
    adminDetails,
    isDetailsLoading,
    statusMutation,
    deleteMutation,
    inviteMutation,
    assignMutation,
    transferMutation
  }
}

export default useAdminsManagement
