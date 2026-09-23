import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { guestService } from "../../services/guestService"
import { toast } from "sonner"

export const useGuestCaseDetails = (caseId, trackingToken) => {
  const queryClient = useQueryClient()

  // Get case details
  const { data: caseDetails, isLoading: detailsLoading, error: detailsError, refetch: refetchDetails } = useQuery({
    queryKey: ['guest-case-details', caseId, trackingToken],
    queryFn: () => guestService.caseDetails(caseId, trackingToken),
    enabled: !!caseId && !!trackingToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get case updates
  const { data: updates, isLoading: updatesLoading, error: updatesError, refetch: refetchUpdates } = useQuery({
    queryKey: ['guest-case-updates', caseId, trackingToken],
    queryFn: () => guestService.caseUpdates(caseId, trackingToken),
    enabled: !!caseId && !!trackingToken,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: (note) => guestService.addNote(caseId, trackingToken, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-case-details', caseId, trackingToken] })
      queryClient.invalidateQueries({ queryKey: ['guest-case-updates', caseId, trackingToken] })
      toast.success('Note added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add note')
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
