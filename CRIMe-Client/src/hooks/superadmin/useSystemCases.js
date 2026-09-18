import { useQuery } from '@tanstack/react-query'
import { superAdminService } from '../../services/superAdminService'

export const useSystemCases = (filters) => {
    const {data, isLoading, error} = useQuery({
        queryKey: ['system-cases', filters],
        queryFn: () => superAdminService.systemCases(filters),
        staleTime: 1000 * 60 * 2, // 2 minutes
    })

    const { data: stations } = useQuery({
        queryKey: ['police-stations'],
        queryFn: () => superAdminService.policeStations(),
        staleTime: 1000 * 60 * 2, // 2 minutes
    })
    
    return {
        cases: data?.cases || [],
        pagination: data?.pagination,
        isLoading,
        error,
        stations: stations || [],
    }
}


