import { useMutation, useQuery } from '@tanstack/react-query'
import { evidenceService } from '../../services/evidenceService'
import { toast } from 'sonner'

export const useEvidence = (isGuest = false) => {
  // Upload standalone evidence (before case creation)
  const uploadStandalone = useMutation({
    mutationFn: (formData) => {
      return isGuest 
        ? evidenceService.uploadGuestStandalone(formData)
        : evidenceService.uploadStandalone(formData)
    },
    onSuccess: (data) => {
      toast.success('Evidence uploaded successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload evidence')
    }
  })

  // Upload evidence to existing case
  const uploadToCase = useMutation({
    mutationFn: ({ caseId, trackingToken, formData }) => {
      if (isGuest && trackingToken) {
        return evidenceService.uploadGuestToCase(trackingToken, formData)
      } else if (caseId) {
        return evidenceService.uploadToCase(caseId, formData)
      }
    },
    onSuccess: (data) => {
      toast.success('Evidence uploaded to case successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload evidence to case')
    }
  })

  // Get evidence for a specific case
  const getCaseEvidence = (caseId) => {
    return useQuery({
      queryKey: ['evidence', 'case', caseId],
      queryFn: () => evidenceService.getCaseEvidence(caseId),
      enabled: !!caseId,
      onError: (error) => {
        toast.error(error.message || 'Failed to fetch evidence')
      }
    })
  }

  // Get single evidence details
  const getEvidence = (evidenceId) => {
    return useQuery({
      queryKey: ['evidence', evidenceId],
      queryFn: () => evidenceService.getEvidence(evidenceId),
      enabled: !!evidenceId,
      onError: (error) => {
        toast.error(error.message || 'Failed to fetch evidence details')
      }
    })
  }

  // Delete evidence (only for SHO)
  const deleteEvidence = useMutation({
    mutationFn: (evidenceId) => evidenceService.deleteEvidence(evidenceId),
    onSuccess: (data) => {
      toast.success('Evidence deleted successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete evidence')
    }
  })

  return {
    uploadStandalone,
    uploadToCase,
    getCaseEvidence,
    getEvidence,
    deleteEvidence
  }
}
