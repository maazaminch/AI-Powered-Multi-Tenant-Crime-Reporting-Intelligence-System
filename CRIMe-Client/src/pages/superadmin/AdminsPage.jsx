import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAdminsManagement } from '../../hooks/superadmin/useAdminsManagement'
import InviteAdminForm from '../../components/features/tenant/InviteAdminForm'
import AssignOrTransferAdminForm from '../../components/features/tenant/assignOrTransferAdminForm'
import { formatError } from '../../lib/utils'

const AdminsPage = () => {
  const [activeTab, setActiveTab] = useState('APPROVED')
  const [page, setPage] = useState(1)

  const [selectedAdminId, setSelectedAdminId] = useState(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'ADMIN' })

  const [selectedTenantAdmin, setSelectedTenantAdmin] = useState(null)
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false)
  const [tenantForm, setTenantForm] = useState({ tenantId: '' })


    const {
      admins,
      tenants,
      pagination,
      isLoading,
      error,
      adminDetails,
      isDetailsLoading,
      statusMutation,
      deleteMutation,
      assignMutation,
      transferMutation,
      inviteMutation,
    } = useAdminsManagement(selectedAdminId, page, activeTab)

  const onUpdateStatus = (userId, newStatus) => {
    statusMutation.mutate({ userId, newStatus })
  }

  const onDelete = (userId) => {
    deleteMutation.mutate(userId)
  }

  //Invite Admin Handlers
  const handleInviteInputChange = (e) => {
    setInviteForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleInviteSubmit = (e) => {
    e.preventDefault()
    inviteMutation.mutate(inviteForm, {
      onSuccess: () => {
        setIsInviteModalOpen(false)
        setInviteForm({ email: '', role: 'ADMIN' })
      },
    })
  }

  //Transfer or assign admin handlers
  const handleAssignOrTransferSubmit = (e) => {
    e.preventDefault()

    if (selectedTenantAdmin.tenantId) {
      // Transfer
      transferMutation.mutate({ adminId: selectedTenantAdmin._id, tenantId: tenantForm.tenantId }, {
        onSuccess: () => {
          setIsTenantModalOpen(false)
          setSelectedTenantAdmin(null)
        },
      })
    } else {
      // Assign
      assignMutation.mutate({ adminId: selectedTenantAdmin._id, tenantId: tenantForm.tenantId }, {
        onSuccess: () => {
          setIsTenantModalOpen(false)
          setSelectedTenantAdmin(null)
        },
      })
    }
  }

  const handleCancelTenantModal = () => {
    setIsTenantModalOpen(false)
    setTenantForm({ tenantId: '' })
    setSelectedTenantAdmin(null)
  }

  const handleOpenTenantModal = (admin) => {
    setSelectedTenantAdmin(admin)

    setTenantForm({ tenantId: admin.tenantId?._id || '' })
    setIsTenantModalOpen(true)
  }
  const handleTenantInputChange = (e) => {
    setTenantForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admins Management</CardTitle>
          <CardDescription>
            Manage all approved and blocked admins. Use the action buttons to view details, block, unblock, or delete.
          </CardDescription>
          <div className='mt-4 flex gap-2'>
            <Button
            variant={activeTab === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('APPROVED')
              setPage(1)
            }}
            >
              Approved Admins
            </Button>
            <Button
            variant={activeTab === 'BLOCKED' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('BLOCKED')
              setPage(1)
            }}
            >
              Blocked Admins
            </Button>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant='default' onClick={() => setIsInviteModalOpen(true)}>
              Invite Admin
            </Button>
          </div>
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
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{activeTab} Admins</h2>
                    <p className="text-sm text-muted-foreground">Admins with active access to the system.</p>
                  </div>
                  <Badge variant="success">{pagination?.totalAdmins ?? admins.length}</Badge>
                </div>

                {admins.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No {activeTab.toLowerCase()} admins found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {admins.map((admin) => (
                      <div key={admin._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <p className="font-semibold">{admin.fullName}</p>
                            <Badge variant="secondary">{admin.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Tenant: {admin.tenantId?.name ?? 'Unassigned'}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-5 sm:mt-0 sm:ml-4">
                          <Button 
                            size="lg"
                            variant='success' 
                            onClick={() => handleOpenTenantModal(admin)}>
                            {admin.tenantId ? 'Transfer Tenant' : 'Assign Tenant'}
                          </Button>
                          <Button variant='outline' 
                          size="sm" onClick={() => setSelectedAdminId(admin._id)}>
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={statusMutation.isPending}
                            onClick={() => onUpdateStatus(admin._id, 
                              admin.status === 'APPROVED' ? 'BLOCKED' : 'APPROVED'
                            )}
                          >
                            {statusMutation.isPending ? 'Updating...' :
                            admin.status === 'APPROVED' ? 'Block' : 'Unblock'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => onDelete(admin._id)}
                          >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
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
            </div>
          )}

          {selectedAdminId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Admin Details</h3>
                    <p className="text-sm text-muted-foreground">Detailed admin information.</p>
                  </div>
                  <button
                    onClick={() => setSelectedAdminId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                {isDetailsLoading ? (
                  <div className="mt-5 space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-4 animate-pulse rounded bg-muted" />
                    ))}
                  </div>
                ) : adminDetails ? (
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{adminDetails.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{adminDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Status</p>
                      <Badge variant={adminDetails.status === 'APPROVED' ? 'success' : 'destructive'}>
                        {adminDetails.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Tenant</p>
                      <p className="text-sm font-medium">
                        {adminDetails.tenantId?.name ?? 'Unassigned'}
                      </p>
                    </div>
                    {adminDetails.createdAt && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(adminDetails.createdAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Unable to load admin details.
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedAdminId(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {isInviteModalOpen && (
          <InviteAdminForm
            formData={inviteForm}
            onChange={handleInviteInputChange}
            onSubmit={handleInviteSubmit}
            onCancel={() => setIsInviteModalOpen(false)}
            isSubmitting={inviteMutation.isPending}
          />
        )}
        {isTenantModalOpen && (
          <AssignOrTransferAdminForm
            adminName={selectedTenantAdmin?.fullName}
            tenants={tenants}
            formData={tenantForm}
            onChange={handleTenantInputChange}
            onSubmit={handleAssignOrTransferSubmit}
            onCancel={handleCancelTenantModal}
            isSubmitting={assignMutation.isPending || transferMutation.isPending}
          />
        )}
      </Card>
    </div>
  )
}

export default AdminsPage
