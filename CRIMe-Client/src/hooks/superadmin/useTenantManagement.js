import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import superAdminService from '../../services/superAdminService'
import { formatError } from '../../lib/utils'
import { useState } from 'react'

export const useTenantManagement = () => {
  const queryClient = useQueryClient()
  const [selectedTenantId, setSelectedTenantId] = useState(null)

  const { data: tenants, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: superAdminService.getTenants,
  })

  const createTenantMutation = useMutation({
    mutationFn: superAdminService.createTenant,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(response?.message || 'Tenant created successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const deleteTenantMutation = useMutation({
    mutationFn: superAdminService.deleteTenant,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(response?.message || 'Tenant deleted successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const toggleTenantMutation = useMutation({
    mutationFn: ({ tenantId }) =>
      superAdminService.activateOrDeactivateTenant(tenantId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(response?.message || 'Tenant status updated')
    },
    onError: (err) => {
      toast.error(formatError(err))
    },
  })

  const { data: tenantDetails, isLoading: isTenantDetailsLoading } = useQuery({
    queryKey: ['tenantDetails', selectedTenantId],
    queryFn: () => superAdminService.getTenantDetails(selectedTenantId),
    enabled: !!selectedTenantId,
  })

  return {
    tenants,
    isLoading,
    error,
    createTenant: createTenantMutation,
    deleteTenant: deleteTenantMutation,
    toggleTenant: toggleTenantMutation,
    tenantDetails,
    isTenantDetailsLoading,
    selectedTenantId,
    setSelectedTenantId,
  }
}
