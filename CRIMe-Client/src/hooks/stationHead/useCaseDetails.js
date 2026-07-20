import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import stationHeadService from '../../services/stationHeadService'

export const useCaseDetails = (caseId) => {
  const queryClient = useQueryClient()

  // Get case details
  const { data: caseDetails, isLoading: detailsLoading, error: detailsError, refetch: refetchDetails } = useQuery({
    queryKey: ['case-details', caseId],
    queryFn: () => stationHeadService.getCaseDetails(caseId),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get case updates
  const { data: updates, isLoading: updatesLoading, error: updatesError, refetch: refetchUpdates } = useQuery({
    queryKey: ['case-updates', caseId],
    queryFn: () => stationHeadService.getCaseUpdates(caseId),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Close case status
  const closeCaseMutation = useMutation({
    mutationFn: ({ remarks }) => stationHeadService.closeCaseStatus(caseId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries(['case-details', caseId])
      queryClient.invalidateQueries(['case-updates', caseId])
      queryClient.invalidateQueries(['station-cases'])
    },
  })

  // Add case update
  const addCaseUpdateMutation = useMutation({
    mutationFn: (updateData) => stationHeadService.addCaseUpdate(caseId, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['case-updates', caseId])
      queryClient.invalidateQueries(['case-details', caseId])
      // Also refetch immediately to ensure fresh data
      queryClient.refetchQueries(['case-updates', caseId])
      queryClient.refetchQueries(['case-details', caseId])
    },
  })

  // Assign case to police
  const assignCaseMutation = useMutation({
    mutationFn: (policeId) => stationHeadService.assignCaseToPolice(caseId, policeId),
    onSuccess: () => {
      queryClient.invalidateQueries(['case-details', caseId])
      queryClient.invalidateQueries(['case-updates', caseId])
      queryClient.invalidateQueries(['station-cases'])
    },
  })

  // Reassign case
  const reassignMutation = useMutation({
    mutationFn: (policeId) => stationHeadService.reassignCase(caseId, policeId),
    onSuccess: () => {
      queryClient.invalidateQueries(['case-details', caseId])
      queryClient.invalidateQueries(['case-updates', caseId])
      queryClient.invalidateQueries(['station-cases'])
    },
  })

  return {
    caseDetails,
    updates,
    isLoading: detailsLoading || updatesLoading,
    error: detailsError || updatesError,
    refetchDetails,
    refetchUpdates,
    closeCase: closeCaseMutation.mutateAsync,
    isClosingCase: closeCaseMutation.isPending,
    addUpdate: addCaseUpdateMutation.mutateAsync,
    isAddingUpdate: addCaseUpdateMutation.isPending,
    assignCase: assignCaseMutation.mutateAsync,
    isAssigning: assignCaseMutation.isPending,
    reassignCase: reassignMutation.mutateAsync,
    isReassigning: reassignMutation.isPending,
  }
}
