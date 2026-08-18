import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'

export const useTenantCases = (filters) => {
    const {data, isLoading, error} = useQuery({
        queryKey: ['tenant-cases', filters],
        queryFn: () => adminService.tenantCases(filters),
        staleTime: 1000 * 60 * 2, // 2 minutes
    })
    
    return {
        cases: data?.cases || [],
        pagination: data?.pagination,
        isLoading,
        error
    }
}


