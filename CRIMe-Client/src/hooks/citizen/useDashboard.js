import { useQuery } from "@tanstack/react-query"
import {citizenService} from "../../services/citizenService"

export const useDashboard = () => {
    const {data, isLoading, error} = useQuery({
        queryKey: ["citizen-dashboard"],
        queryFn: () => citizenService.dashboardStats(),
        staleTime: 1000 * 60,
    })
    return {
        stats: data ?? {},
        isLoading, 
        error
    }
}