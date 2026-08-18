import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useNotifications } from '../../hooks/notifications/useNotifications'
import { formatError } from '../../lib/utils'
import { Bell, Check, Clock } from 'lucide-react'

import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'
import NoData from '../../components/ui/feedback/NoData'


const AdminNotificationPage = () => {

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
            </CardTitle>
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
              <Loader 
                title='Loading notifications...'
              />
          ) : error ? (
            <ErrorState 
              title='Error loading notifications'
              description="Please try again later."
            />
          ) : notificationsList.length === 0 ? (
            <NoData title='Notifications not found'/>
          ) : (
            <div className="space-y-3">
              {notificationsList.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  onClick={() => handleMarkAsRead(notification._id)}
                  style={{ cursor: 'pointer' }}
                  className={`rounded-lg border-2 bg-card p-4 sm:flex sm:items-center sm:justify-between transition-all ${!notification.isRead ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      <p className="font-semibold text-slate-800">{notification.title}</p>
                    </div>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-3 h-3" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Badge variant="outline" className="border-blue-400 text-blue-600">
                        New
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}


          {pagination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 flex items-center justify-end gap-2"
            >
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="border-2"
                  disabled={!pagination?.hasPrevPage}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
              </motion.div>
              <div className="text-sm text-slate-600 mr-4">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="border-2"
                  disabled={!pagination?.hasNextPage}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                >
                  Next
                </Button>
              </motion.div>
            </motion.div>
          )}

        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}

export default AdminNotificationPage
