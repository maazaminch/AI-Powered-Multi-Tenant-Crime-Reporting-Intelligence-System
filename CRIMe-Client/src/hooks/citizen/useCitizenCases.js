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
        pagination: data?.pagination,
        isLoading,
        error,
        refetch
    }
}