import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePendingAdminRequests } from '../../hooks/superadmin/usePendingAdminRequests'

import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'
import NoData from '../../components/ui/feedback/NoData'

import { 
  Clock
 } from 'lucide-react'

const PendingRequestsPage = () => {
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10
  })
  
  const {
    pendingAdmins,
    totalPendingAdmins,
    pagination,
    isLoading,
    error,
    approveUser,
    rejectUser,
  } = usePendingAdminRequests(filters)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className="w-6 h-6" />
            Pending Admin Requests
          </CardTitle>
          <CardDescription>
            Review pending admin registrations and approve or reject them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <Loader 
              text='Loading pending admin requests...'
              fullScreen
            />
          ) : error ? (
            <ErrorState title='Error loading pending admin requests' />
          ) : pendingAdmins.length === 0 ? (
            <NoData title="No pending admin requests found." />
          ) : (
            <div className="space-y-3">
              <div  className='flex justify-end'>
              <Badge variant='warning'>Pending Admins: {totalPendingAdmins}</Badge>
              </div>
              {pendingAdmins.map((admin) => (
                <div key={admin._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="font-semibold">{admin.fullName}</p>
                      <Badge variant="info">{admin.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested on: {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0 sm:ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approveUser.isPending}
                      onClick={() => approveUser.mutate(admin._id)}
                    >
                      {approveUser.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={rejectUser.isPending}
                      onClick={() => rejectUser.mutate(admin._id)}
                    >
                      {rejectUser.isPending ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>


      {pagination && (
                  <div className="mt-6 flex items-center justify-end gap-2">            
                    <Button
                      variant="outline"
                      disabled={!pagination?.hasPrevPage}
                      onClick={() => setFilters(prev => 
                        ({
                          ...prev,
                          page: Math.max(1, prev.page - 1)
                        })
                      )}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground mr-4">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      disabled={!pagination?.hasNextPage}
                      onClick={() => setFilters(prev => 
                        ({
                          ...prev,
                          page: Math.min(pagination.totalPages, prev.page + 1)
                        })
                      )}
                    >
                      Next
                    </Button>
                  </div>
                )}

      </Card>
    </div>
  )
}

export default PendingRequestsPage
