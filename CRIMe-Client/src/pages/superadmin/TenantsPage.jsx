import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useTenantManagement } from '../../hooks/superadmin/useTenantManagement'
import TenantForm from '../../components/features/tenant/TenantForm'
import { formatError } from '../../lib/utils'

const TenantsPage = () => {
  const {
    tenants,
    isLoading,
    error,
    createTenant,
    deleteTenant,
    toggleTenant,
    tenantDetails,
    isTenantDetailsLoading,
    selectedTenantId,
    setSelectedTenantId,
  } = useTenantManagement()

  const [formData, setFormData] = useState({ name: '', region: '', type: '' })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState(null)

  const tenantList = tenants?.tenants ?? []

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    createTenant.mutate(formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false)
        setFormData({ name: '', region: '', type: '' })
      },
    })
  }

  const handleConfirmDelete = () => {
    if (!tenantToDelete) return
    deleteTenant.mutate(tenantToDelete, {
      onSuccess: () => setTenantToDelete(null),
    })
  }

  const handleToggle = (id) => {
    toggleTenant.mutate({ tenantId: id })
  }

  const pendingToggleId = toggleTenant.isPending
    ? toggleTenant.variables?.tenantId
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tenant Management</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Tenants</h3>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create New Tenant
            </Button>
          </div>

          {isCreateModalOpen && (
            <TenantForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleCreateSubmit}
              isSubmitting={createTenant.isPending}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          )}

          {selectedTenantId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tenant Details</h3>
                  <button
                    onClick={() => setSelectedTenantId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                {isTenantDetailsLoading ? (
                  <div className="mt-4 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-4 animate-pulse rounded bg-muted"
                      />
                    ))}
                  </div>
                ) : tenantDetails ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Name
                      </p>
                      <p className="text-sm font-medium">{tenantDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Region
                      </p>
                      <p className="text-sm font-medium">{tenantDetails.region}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Type
                      </p>
                      <p className="text-sm font-medium">{tenantDetails.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Status
                      </p>
                      <div className="mt-1">
                        <Badge
                          variant={
                            tenantDetails.isActive ? 'success' : 'muted'
                          }
                        >
                          {tenantDetails.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    {tenantDetails.code && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Tenant Code
                        </p>
                        <p className="text-sm font-medium">{tenantDetails.code}</p>
                      </div>
                    )}
                    {tenantDetails.createdAt && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Created
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(tenantDetails.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Failed to load tenant details
                  </p>
                )}
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTenantId(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tenantToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
                <h3 className="text-lg font-semibold">Delete tenant?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This action cannot be undone. The tenant will be permanently
                  removed.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTenantToDelete(null)}
                    disabled={deleteTenant.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={deleteTenant.isPending}
                  >
                    {deleteTenant.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg border bg-muted/40"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formatError(error)}
            </div>
          ) : tenantList.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No tenants yet. Create your first tenant to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {tenantList.map((tenant) => (
                <div
                  key={tenant._id}
                  className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-base font-semibold">
                        {tenant.name}
                      </h4>
                      <Badge
                        variant={tenant.isActive ? 'success' : 'muted'}
                      >
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tenant.region} · {tenant.type}
                      {tenant.code ? ` · ${tenant.code}` : ''}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTenantId(tenant._id)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        toggleTenant.isPending &&
                        pendingToggleId === tenant._id
                      }
                      onClick={() => handleToggle(tenant._id)}
                    >
                      {toggleTenant.isPending &&
                      pendingToggleId === tenant._id
                        ? 'Updating...'
                        : tenant.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteTenant.isPending}
                      onClick={() => setTenantToDelete(tenant._id)}
                    >
                      Delete
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

export default TenantsPage
