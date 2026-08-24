import { useQuery } from '@tanstack/react-query'
import { auditService } from '../../services/auditService'

export const useAuditLogs = (filters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditService.getAuditLogs(filters),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2 // 2 minutes
  })

  return {
    logs: data?.logs || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    refetch
  }
}

export const useAuditStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: auditService.getAuditStats,
    refetchInterval: 60000, // Auto-refresh every minute
    staleTime: 1000 * 60 // 1 minute
  })

  return {
    stats: data || {},
    isLoading,
    error
  }
}
