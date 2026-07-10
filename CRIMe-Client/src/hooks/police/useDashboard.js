import { useQuery } from "@tanstack/react-query"
import policeService from "../../services/policeService"

export const useDashboard = () => {
    const {data, isLoading, error} = useQuery({
        queryKey: ["police-dashboard"],
        queryFn: () => policeService.dashboardStats(),
        staleTime: 1000 * 60,
    })
    return {
        stats: data ?? {},
        isLoading, 
        error
    }
}