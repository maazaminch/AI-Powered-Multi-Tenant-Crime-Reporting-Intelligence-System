import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../../store/authStore'
import socketService from '../../services/socketService'

export const useSocket = (authInitialized) => {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!authInitialized || !isAuthenticated) {
      socketService.disconnect()
      return
    }

    socketService.connect()

    const handleNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['header-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    }

    socketService.on('notification', handleNotification)

    return () => {
      socketService.off('notification', handleNotification)
      socketService.disconnect()
    }
  }, [authInitialized, isAuthenticated, queryClient])
}
