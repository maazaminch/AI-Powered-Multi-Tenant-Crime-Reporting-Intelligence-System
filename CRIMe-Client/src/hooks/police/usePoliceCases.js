import { useQuery } from "@tanstack/react-query"
import policeService from "../../services/policeService"

export const usePoliceCases = (filters = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['police-cases', filters],
        queryFn: () => policeService.getMyCases(filters),
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