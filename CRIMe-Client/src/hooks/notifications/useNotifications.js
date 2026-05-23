import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query"
import { notificationsService } from "../../services/notificationsService"


export const useNotifications = (page) => {

    const queryClient = useQueryClient()

    const {data, isLoading, error} = useQuery({
        queryKey: ['notifications', page],
        queryFn: () => notificationsService.getUserNotifications(page),
    })

    const {data: headerNotifications} = useQuery({
        queryKey: ['header-notifications'],
        queryFn: notificationsService.getUserNotificationsForHeader,
    })

    const markAsReadMutation = useMutation({
        mutationFn: (notificationId) => 
            notificationsService.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['header-notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unread-count'] })
        },
    })

    const {data: unreadCount} = useQuery({
        queryKey: ['unread-count'],
        queryFn: notificationsService.getUnreadCount,
    })

    return {
        notifications: data?.notifications,
        pagination: data?.pagination,
        headerNotifications,
        unreadCount,
        isLoading,
        error,
        markAsRead: markAsReadMutation,
    }

}