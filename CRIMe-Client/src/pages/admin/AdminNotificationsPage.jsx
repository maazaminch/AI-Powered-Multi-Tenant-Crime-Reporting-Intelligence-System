import React , {useState}  from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import {Button} from '../../components/ui/Button'
import {Badge} from '../../components/ui/Badge'
import { useNotifications } from '../../hooks/notifications/useNotifications'
import { formatError } from '../../lib/utils'

const AdminNotificationsPage = () => {

    const [page, setPage] = useState(1)

  const {
      notifications,
      isLoading,
      error,
      headerNotifications, //it goes to layout
      markAsRead,
      unreadCount,
      pagination,
  } = useNotifications(page)


  const notificationsList = notifications ?? []

  const totalUnreadCount = unreadCount?.unreadCount || 0

  const handleMarkAsRead = (notificationId) => {
    markAsRead.mutate(notificationId)
  }



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notifications and stay updated with the latest alerts and messages.
            <div className="flex items-center justify-end mt-2 gap-4">  
              <Badge variant="destructive">Unread {totalUnreadCount}</Badge>
              <Badge variant="success">Total Notifications {pagination?.totalNotifications ?? notificationsList.length}</Badge>
              </div>
          </CardDescription>
        </CardHeader>
        <CardContent>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-lg border bg-muted/40" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formatError(error)}
            </div>
          ) : notificationsList.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No notifications found.
            </div>
          ) : (
            <div className="space-y-3">
              {notificationsList.map((notification) => (
                <div 
                key={notification._id} 
                onClick={() => handleMarkAsRead(notification._id)} style={{ cursor: 'pointer' }}
                className={`rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between ${!notification.isRead ? 'border-blue-500' : 'border-gray-200'}`}>
                  <div className="min-w-0 space-y-2">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Received on: {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                      
                    >    
                </div>
                </div>
              ))}
            </div>
          )}


          {pagination && (
            <div className="mt-6 flex items-center justify-end gap-2">
              <div className="text-sm text-muted-foreground mr-4">
                Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                    <Button
                      variant="outline"
                      disabled={!pagination?.hasPrevPage}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                    Previous
                    </Button>
          
                    <Button
                      variant="outline"
                      disabled={!pagination?.hasNextPage}
                      onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    >
                    Next
                    </Button>
                  </div>
                )}

        </CardContent>
      </Card>
    </div>
  )
}

export default AdminNotificationsPage
