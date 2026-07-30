import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { policeService } from "../../services/policeService"
import { toast } from "sonner"

export const useCaseDetails = (caseId) => {
  const queryClient = useQueryClient()

  // Get case details
  const { data: caseDetails, isLoading: detailsLoading, error: detailsError, refetch: refetchDetails } = useQuery({
    queryKey: ['police-case-details', caseId],
    queryFn: () => policeService.getCaseDetails(caseId),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get case updates
  const { data: updates, isLoading: updatesLoading, error: updatesError, refetch: refetchUpdates } = useQuery({
    queryKey: ['police-case-updates', caseId],
    queryFn: () => policeService.getCaseUpdates(caseId),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Add case update mutation
  const addUpdateMutation = useMutation({
    mutationFn: (updateData) => policeService.addCaseUpdate(caseId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['police-case-details', caseId] })
      queryClient.invalidateQueries({ queryKey: ['police-case-updates', caseId] })
      queryClient.invalidateQueries({ queryKey: ['police-cases'] })
      toast.success('Case update added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add case update')
    }
  })

  // Update case status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (statusData) => policeService.updateCaseStatus(caseId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['police-case-details', caseId] })
      queryClient.invalidateQueries({ queryKey: ['police-case-updates', caseId] })
      queryClient.invalidateQueries({ queryKey: ['police-cases'] })
      toast.success('Case status updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update case status')
    }
  })

  return {
    caseDetails,
    updates,
    detailsLoading,
    updatesLoading,
    detailsError,
    updatesError,
    refetchDetails,
    refetchUpdates,
    addUpdateMutation,
    updateStatusMutation
  }
}