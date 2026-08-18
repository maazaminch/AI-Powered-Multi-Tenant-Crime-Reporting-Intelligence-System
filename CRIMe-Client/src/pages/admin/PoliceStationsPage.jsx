import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePoliceStationManagement } from '../../hooks/admin/usePoliceStation'

import StationDetailsModal from '../../components/features/police-stations/modals/StationDetailsModal'
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal'
import CreateStationModal from '../../components/features/police-stations/modals/CreateStationModal'
import AssignSHOModal from '../../components/features/police-stations/modals/AssignSHOModal'
import RemoveSHOModal from '../../components/features/police-stations/modals/RemoveSHOModal'

import Loader from '../../components/ui/feedback/Loader';
import ErrorState from '../../components/ui/feedback/ErrorState';
import NoData from '../../components/ui/feedback/NoData';

import { 
  FileText, 
  Search, 
  Filter, 
  ChevronDown,
} from 'lucide-react'



const PoliceStationsPage = () => {


  const [shoStationId, setShoStationId] = useState(null)
  const [removeShoStationId, setRemoveShoStationId] = useState(null)
  const [selectedStationId, setSelectedStationId] = useState(null)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,

    search: '',
    isActive: undefined
  })

  const [showFilters, setShowFilters] = useState(false)

  const {
    stations,
    totalStations,
    pagination,
    isLoading,
    error,
    createStation,
    deleteStation,
    toggleStation,
    assignOrChangeSho,
    removeSho,
  } = usePoliceStationManagement(filters)

  //its only for dashboard page because without using location i cannot go to the tenant form directly
  const location = useLocation()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    location.state?.openCreateModal || false)
  const [stationToDelete, setStationToDelete] = useState(null)

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

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


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Police Station Management</CardTitle>
          <CardDescription>Manage police stations and their details</CardDescription>
        
          <Button
            className='ml-auto justify-end'
            variant="success"
            onClick={() => setIsCreateModalOpen(true)}>
              Create New Station
          </Button>
        </CardHeader>
      </Card> 


      {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by name"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
      
                  {/* Expandable Filters */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
  
      
                      <div>
                        <select
                          value={filters.isActive}
                          onChange={(e) => handleFilterChange('isActive', e.target.value)}
                          className="w-full px-3 py-2 h-10 border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
      
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() => setFilters({
                            page: 1,
                            search: '',
                            isActive: ''
                          })}
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Stations</h3>
              <Badge variant="success">Total Stations: {totalStations}</Badge>
          </div>
            
          {isLoading ? (
            <Loader 
              text='Loading stations...'
              fullScreen
            />
          ) : error ? (
            <ErrorState 
              title='Error loading stations'
            />
          ) : stations.length === 0 ? (
            <NoData 
              title='No stations found'
            />
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
                      disabled={assignOrChangeSho.isPending }
                      onClick={() => {if (!station._id) {return}
                        setShoStationId(station._id)
                      }}
                    >
                      {station.stationHead ? 'Change SHO' : 'Assign SHO'}
                    </Button>
                    {station.stationHead && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={removeSho.isPending}
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
                      disabled={toggleStation.isPending}
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
        </CardContent>
      </Card>

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
            stationId={selectedStationId}
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
    </div>
  )
}

export default PoliceStationsPage
