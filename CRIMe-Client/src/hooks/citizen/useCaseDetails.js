import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { citizenService } from "../../services/citizenService"
import { toast } from "sonner"

export const useCaseDetails = (caseId) => {
  const queryClient = useQueryClient()

  // Get case details
  const { data: caseDetails, isLoading: detailsLoading, error: detailsError, refetch: refetchDetails } = useQuery({
    queryKey: ['citizen-case-details', caseId],
    queryFn: () => citizenService.caseDetails(caseId),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get case updates
  const { data: updates, isLoading: updatesLoading, error: updatesError, refetch: refetchUpdates } = useQuery({
    queryKey: ['citizen-case-updates', caseId],
    queryFn: () => citizenService.caseUpdates(caseId),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Add case update mutation
  const addNoteMutation = useMutation({
    mutationFn: (updateData) => citizenService.addNote(caseId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen-case-details', caseId] })
      queryClient.invalidateQueries({ queryKey: ['citizen-case-updates', caseId] })
      queryClient.invalidateQueries({ queryKey: ['citizen-cases'] })
      toast.success('Note added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add case update')
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
    addNote: addNoteMutation
  }
}