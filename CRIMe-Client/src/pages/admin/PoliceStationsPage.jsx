import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePoliceStationManagement } from '../../hooks/admin/usePoliceStation'
import { formatError } from '../../lib/utils'

import StationDetailsModal from '../../components/features/police-stations/modals/StationDetailsModal'
import DeleteConfirmationModal from '../../components/features/DeleteConfirmationModal'
import CreateStationModal from '../../components/features/police-stations/modals/CreateStationModal'
import AssignSHOModal from '../../components/features/police-stations/modals/AssignSHOModal'
import RemoveSHOModal from '../../components/features/police-stations/modals/RemoveSHOModal'

const PoliceStationsPage = () => {


  const [page, setPage] = useState(1)
  const [shoStationId, setShoStationId] = useState(null)
  const [removeShoStationId, setRemoveShoStationId] = useState(null)
  const [selectedStationId, setSelectedStationId] = useState(null)

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
    assignOrChangeSho,
    removeSho,
  } = usePoliceStationManagement(page, selectedStationId)

  //its only for dashboard page because without using location i cannot go to the tenant form directly
  const location = useLocation()
  const navigate = useNavigate()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    location.state?.openCreateModal || false)
  const [stationToDelete, setStationToDelete] = useState(null)


  const handleCreateSubmit = (stationData) => {
    createStation.mutate(stationData, { onSuccess: () => setIsCreateModalOpen(false) })
  }

  const handleConfirmDelete = () => {
    if (!stationToDelete) return
    deleteStation.mutate(stationToDelete, {
      onSuccess: () => setStationToDelete(null),
    })
  }

  const handleToggle = (stationId) => {
    toggleStation.mutate(stationId)
  }

  const handleAssignSho = ({ stationId, policeId }) => {
    if (!stationId || !policeId) {
      return
    }
    assignOrChangeSho.mutate({ stationId, policeId }, {
      onSuccess: () => {
        setShoStationId(null)
        setSelectedStationId(null)
      }
    })
  }

  const handleRemoveSho = () => {
    if (!removeShoStationId) return
    removeSho.mutate({ stationId: removeShoStationId }, {
      onSuccess: () => {
        setRemoveShoStationId(null)
        setSelectedStationId(null)
      }
    })
  }

  const pendingToggleId = toggleStation.isPending
    ? toggleStation.variables
    : null

  const pendingDeleteId = deleteStation.isPending
    ? deleteStation.variables?.stationId
    : null

  const pendingAssignOrChangeShoId = assignOrChangeSho.isPending
    ? assignOrChangeSho.variables?.stationId
    : null

  const pendingRemoveShoId = removeSho.isPending
    ? removeSho.variables?.stationId
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Police Station Management</CardTitle>
          <CardDescription>Manage police stations and their details</CardDescription>
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

          {/* Create Station */}
          <CreateStationModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateSubmit}
            isSubmitting={createStation.isPending}
          />

          {/* Station Details */}
          <StationDetailsModal
            open={!!selectedStationId}
            onClose={() => setSelectedStationId(null)}
            stationDetails={stationDetails}
            isLoading={isStationDetailsLoading}
          />

          {/* Delete Confirmation */}
          <DeleteConfirmationModal
            open={!!stationToDelete}
            onClose={() => setStationToDelete(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={deleteStation.isPending}
          />

          {/* Assign/Change SHO */}
          <AssignSHOModal
            open={!!shoStationId}
            onClose={() => setShoStationId(null)}
            onAssign={handleAssignSho}
            stationId={shoStationId}
            isAssigning={assignOrChangeSho.isPending}
          />

          {/* Remove SHO */}
          <RemoveSHOModal
            open={!!removeShoStationId}
            onClose={() => setRemoveShoStationId(null)}
            onConfirm={handleRemoveSho}
            shoName={stations.find(s => s._id === removeShoStationId)?.stationHead?.fullName || ''}
            isRemoving={removeSho.isPending}
          />

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
          ) : stations.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No stations yet. Create your first station to get started.
            </div>
          ) : (
            
            <div className="space-y-3">
              {stations.map((station) => (
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
                        variant={station.isActive ? 'success' : 'destructive'}
                      >
                        {station.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Station Code:</span> {station.code ? station.code : 'N/A'}
                    </p>
                    {station.stationHead && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">SHO:</span> {station.stationHead.fullName}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-4">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={
                        assignOrChangeSho.isPending &&
                        pendingAssignOrChangeShoId === station._id
                      }
                      onClick={() => {
                        if (!station._id) {
                          return
                        }
                        setShoStationId(station._id)
                      }}
                    >
                      {station.stationHead ? 'Change SHO' : 'Assign SHO'}
                    </Button>
                    {station.stationHead && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={
                          removeSho.isPending &&
                          pendingRemoveShoId === station._id
                        }
                        onClick={() => setRemoveShoStationId(station._id)}
                      >
                        Remove SHO
                      </Button>
                    )}
                    
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
                      disabled={
                        deleteStation.isPending &&
                        pendingDeleteId === station._id
                      }
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
