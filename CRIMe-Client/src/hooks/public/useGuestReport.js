import { useMutation } from '@tanstack/react-query'
import { publicService } from '../../services/publicService'
import { toast } from 'sonner'

export const useSendOTP = () => {
  return useMutation({
    mutationFn: (email) => publicService.sendOTP(email),
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
    mutationFn: ({ sessionId, otp }) => publicService.verifyOTP(sessionId, otp),
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
    mutationFn: (caseData) => publicService.reportCase(caseData),
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
    mutationFn: ({ caseId, trackingToken }) => publicService.trackCase(caseId, trackingToken),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to track case')
      throw error
    }
  })
}

export const useGuestSuggestStations = () => {
  return useMutation({
    mutationFn: ({ lng, lat }) => publicService.suggestNearestStations(lng, lat),
    onError: (error) => {
      toast.error('Failed to fetch nearby stations')
      throw error
    }
  })
}