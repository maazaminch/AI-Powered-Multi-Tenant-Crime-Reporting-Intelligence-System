import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '../../services/authService'
import { usersService } from '../../services/usersService'
import { formatError } from '../../lib/utils'

export const useProfile = () => {
  const queryClient = useQueryClient()

  // Get current user profile
  const { data: userProfile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: authService.getCurrentUser,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success(response?.message || 'Profile updated successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: usersService.changePassword,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success(response?.message || 'Password changed successfully')
    },
    onError: (err) => {
      toast.error(formatError(err))
    }
  })

  return {
    // Profile data
    user: userProfile?.data?.user,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,

    // Mutations (page will call .mutate() or .mutateAsync())
    updateProfile: updateProfileMutation,
    changePassword: changePasswordMutation
  }
}

export default useProfile
