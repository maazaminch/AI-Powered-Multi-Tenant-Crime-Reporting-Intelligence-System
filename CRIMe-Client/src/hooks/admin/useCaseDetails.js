import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";

export const useCaseDetails = (caseId) => {
    
    const { data: caseDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
        queryKey: ['case-details', caseId],
        queryFn: () => adminService.caseDetails(caseId),
        enabled: !!caseId,
        staleTime: 1000 * 60 * 5, // 5 minutes
      })
    
      // Get case updates
      const { data: updates, isLoading: updatesLoading, error: updatesError } = useQuery({
        queryKey: ['case-updates', caseId],
        queryFn: () => adminService.caseUpdates(caseId),
        enabled: !!caseId,
        staleTime: 1000 * 60 * 2, // 2 minutes
      })

    
    return {
        caseDetails,
        updates,
        detailsLoading,
        updatesLoading,
        detailsError,
        updatesError
    }
}

