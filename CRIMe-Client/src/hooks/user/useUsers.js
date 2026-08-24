import { useQuery } from '@tanstack/react-query'
import { usersService } from '../../services/usersService'


// this for audit log to get users for admin and super admin
export const useUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getUsers,
    staleTime: 1000 * 60 * 5 // 5 minutes - users don't change that often
  })

  return {
    users: data?.data || [],
    isLoading,
    error
  }
}
