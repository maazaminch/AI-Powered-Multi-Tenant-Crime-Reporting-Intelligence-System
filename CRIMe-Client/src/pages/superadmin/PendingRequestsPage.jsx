import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePendingAdminRequests } from '../../hooks/superadmin/usePendingAdminRequests'
import { formatError } from '../../lib/utils'

const PendingRequestsPage = () => {
  const {
    pendingAdmins,
    isLoading,
    error,
    approveMutation,
    rejectMutation,
  } = usePendingAdminRequests()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Admin Requests</CardTitle>
          <CardDescription>
            Review pending admin registrations and approve or reject them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          ) : pendingAdmins.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No pending admin requests found.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAdmins.map((admin) => (
                <div key={admin._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="font-semibold">{admin.fullName}</p>
                      <Badge variant="secondary">{admin.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Tenant: {admin.tenantId?.name ?? 'Unassigned'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested on: {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0 sm:ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(admin._id)}
                    >
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(admin._id)}
                    >
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PendingRequestsPage
