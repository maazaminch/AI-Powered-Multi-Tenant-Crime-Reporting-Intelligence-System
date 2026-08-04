import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { publicService } from "../../services/publicService"
import { toast } from "sonner"

export const usePublicCaseDetails = (caseId, trackingToken) => {
  const queryClient = useQueryClient()

  // Get case details
  const { data: caseDetails, isLoading: detailsLoading, error: detailsError, refetch: refetchDetails } = useQuery({
    queryKey: ['public-case-details', caseId, trackingToken],
    queryFn: () => publicService.caseDetails(caseId, trackingToken),
    enabled: !!caseId && !!trackingToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get case updates
  const { data: updates, isLoading: updatesLoading, error: updatesError, refetch: refetchUpdates } = useQuery({
    queryKey: ['public-case-updates', caseId, trackingToken],
    queryFn: () => publicService.caseUpdates(caseId, trackingToken),
    enabled: !!caseId && !!trackingToken,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: (note) => publicService.addNote(caseId, trackingToken, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-case-details', caseId, trackingToken] })
      queryClient.invalidateQueries({ queryKey: ['public-case-updates', caseId, trackingToken] })
      toast.success('Note added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add note')
    }
  })

  // Upload evidence mutation
  const uploadEvidenceMutation = useMutation({
    mutationFn: (evidenceFiles) => publicService.uploadEvidence(caseId, trackingToken, evidenceFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-case-details', caseId, trackingToken] })
      queryClient.invalidateQueries({ queryKey: ['public-case-updates', caseId, trackingToken] })
      toast.success('Evidence uploaded successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload evidence')
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
    addNote: addNoteMutation,
    uploadEvidence: uploadEvidenceMutation
  }
}
