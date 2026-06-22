import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePendingPoliceRequests } from '../../hooks/admin/usePendingPoliceRequests'
import { formatError } from '../../lib/utils'



const PendingPolicePage = () => {

    const [page, setPage] = useState(1)
    const {
        pendingPolice,
        isLoading,
        error,
        pagination,
        approvePolice,
        rejectPolice,
    } = usePendingPoliceRequests(page)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Pending Police Requests</CardTitle>
                    <CardDescription>
                        Review pending police registrations and approve or reject them.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
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
                    ) : pendingPolice.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            No pending police requests found.
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {pendingPolice.map((police) => (
                                <div key={police._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <p className="font-semibold text-lg">{police.fullName}</p>
                                            <Badge variant="success">{police.role}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            <span className='font-semibold'>Email:</span> {police.email}
                                        </p>
                                        {/* <p className="text-sm text-muted-foreground">
                                            Tenant: {police.tenantId?.name ?? 'Unassigned'}
                                        </p> */}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => approvePolice.mutate(police._id)}
                                            disabled={approvePolice.isPending}
                                        >
                                            {approvePolice.isPending ? 'Approving...' : 'Approve'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => rejectPolice.mutate(police._id)}
                                            disabled={rejectPolice.isPending}
                                        >
                                            {rejectPolice.isPending ? 'Rejecting...' : 'Reject'}
                                        </Button>
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
                                size="sm"
                                variant="outline"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                                disabled={page === pagination.totalPages}
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

export default PendingPolicePage