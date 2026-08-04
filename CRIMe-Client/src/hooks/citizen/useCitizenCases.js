import { useQuery } from "@tanstack/react-query"
import { citizenService } from "../../services/citizenService"

export const useCitizenCases = (filters = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['citizen-cases', filters],
        queryFn: () => citizenService.citizenCases(filters),
        staleTime: 1000 * 60 * 2, // 2 minutes
    })

    return {
        cases: data?.cases ?? [],
        totalCases: data?.totalCases ?? 0,
        pagination: data?.pagination,
        isLoading,
        error,
        refetch
    }
}