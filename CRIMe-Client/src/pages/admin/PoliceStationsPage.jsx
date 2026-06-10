import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePoliceStationManagement } from '../../hooks/admin/usePoliceStation'
import PoliceStationForm from '../../components/features/police-stations/PoliceStationForm'
import { formatError } from '../../lib/utils'
import { set } from 'react-hook-form';

const PoliceStationsPage = () => {


  const [page, setPage] = useState(1)

  const {
    stations,
    pagination,
    isLoading,
    error,
    createStation,
    deleteStation,
    toggleStation,
    stationDetails,
    isStationDetailsLoading,
    selectedStationId,
    setSelectedStationId,
  } = usePoliceStationManagement(page)

  //its only for dashboard page because without using location i cannot go to the tenant form directly
  const location = useLocation()
  const navigate = useNavigate()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    location.state?.openCreateModal || false)
  const [stationToDelete, setStationToDelete] = useState(null)

  const stationList = stations?.stations ?? []

  const handleCreateSubmit = (stationData) => {
    createStation.mutate(stationData, { onSuccess: () => setIsCreateModalOpen(false) })
  }

  const handleConfirmDelete = () => {
    if (!stationToDelete) return
    deleteStation.mutate(stationToDelete, {
      onSuccess: () => setStationToDelete(null),
    })
  }

  const handleToggle = (id) => {
    toggleStation.mutate({ stationId: id })
  }

  const pendingToggleId = toggleStation.isPending
    ? toggleStation.variables?.stationId
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Police Station Management</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Stations</h3>

            <Button
              variant="success"
              onClick={() => setIsCreateModalOpen(true)}>
              Create New Station
            </Button>
          </div>

          {isCreateModalOpen && (
            <PoliceStationForm
              onSubmit={handleCreateSubmit}
              isSubmitting={createStation.isPending}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          )}

          {selectedStationId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full bg-white max-w-md rounded-lg border p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Station Details</h3>
                  <button
                    onClick={() => setSelectedStationId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                {isStationDetailsLoading ? (
                  <div className="mt-4 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-4 animate-pulse rounded bg-muted"
                      />
                    ))}
                  </div>
                ) : stationDetails ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Name
                      </p>
                      <p className="text-sm font-medium">{stationDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Location
                      </p>
                      <p className="text-sm font-medium">{stationDetails.location}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Address
                      </p>
                      <p className="text-sm font-medium">{stationDetails.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Status
                      </p>
                      <div className="mt-1">
                        <Badge
                          variant={
                            stationDetails.isActive ? 'success' : 'muted'
                          }
                        >
                          {stationDetails.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    {stationDetails.code && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Station Code
                        </p>
                        <p className="text-sm font-medium">{stationDetails.code}</p>
                      </div>
                    )}
                    {stationDetails.createdAt && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Created
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(stationDetails.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Failed to load station details
                  </p>
                )}
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStationId(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {stationToDelete && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-background bg-white rounded-lg shadow-xl border p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold">Delete station?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This action cannot be undone. The station will be permanently
                  removed.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStationToDelete(null)}
                    disabled={deleteStation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={deleteStation.isPending}
                  >
                    {deleteStation.isPending ? 'Deleting...' : 'Delete'}
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
          ) : stationList.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No stations yet. Create your first station to get started.
            </div>
          ) : (
            
            <div className="space-y-3">
              {stationList.map((station) => (
                <div
                  key={station._id}
                  className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-base font-semibold">
                        {station.name}
                      </h4>
                      <Badge
                        variant={station.isActive ? 'success' : 'muted'}
                      >
                        {station.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {station.code ? `${station.code}, ` : ''} 
                      {station.address}
                      
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStationId(station._id)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={
                        toggleStation.isPending &&
                        pendingToggleId === station._id
                      }
                      onClick={() => handleToggle(station._id)}
                    >
                      {toggleStation.isPending &&
                      pendingToggleId === station._id
                        ? 'Updating...'
                        : station.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleteStation.isPending}
                      onClick={() => setStationToDelete(station._id)}
                    >
                      Delete
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

export default PoliceStationsPage
