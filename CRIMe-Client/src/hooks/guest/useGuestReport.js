import { useMutation } from '@tanstack/react-query'
import { guestService } from '../../services/guestService'
import { toast } from 'sonner'

export const useSendOTP = () => {
  return useMutation({
    mutationFn: (email) => guestService.sendOTP(email),
    onSuccess: (data) => {
      toast.success('OTP sent to your email')
      return data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
      throw error
    }
  })
}

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ sessionId, otp }) => guestService.verifyOTP(sessionId, otp),
    onSuccess: (data) => {
      toast.success('OTP verified successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify OTP')
      throw error
    }
  })
}

export const useGuestReportCase = () => {
  return useMutation({
    mutationFn: (caseData) => guestService.reportCase(caseData),
    onSuccess: (data) => {
      toast.success('Case reported successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to report case')
      throw error
    }
  })
}

export const useTrackCase = () => {
  return useMutation({
    mutationFn: ({ caseId, trackingToken }) => guestService.trackCase(caseId, trackingToken),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to track case')
      throw error
    }
  })
}

export const useGuestSuggestStations = () => {
  return useMutation({
    mutationFn: ({ lng, lat }) => guestService.suggestNearestStations(lng, lat),
    onError: (error) => {
      toast.error('Failed to fetch nearby stations')
      throw error
    }
  })
}