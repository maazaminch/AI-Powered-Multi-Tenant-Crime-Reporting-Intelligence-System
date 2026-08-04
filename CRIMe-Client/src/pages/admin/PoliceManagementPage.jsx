import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePoliceManagement } from '../../hooks/admin/usePoliceManagement'
import { usePoliceStationManagement } from '../../hooks/admin/usePoliceStation'

import InvitePoliceModal from '../../components/features/police/modals/InvitePoliceModal'
import AssignOrTransferStationModal from '../../components/features/police/modals/AssignOrTransferStationModal'
import PoliceDetailsModal from '../../components/features/police/modals/PoliceDetailsModal'
import DeleteConfirmationModal from '../../components/features/DeleteConfirmationModal'

import { 
  Search, 
  Filter, 
  ChevronDown
} from 'lucide-react'

import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'
import NoData from '../../components/ui/feedback/NoData'

const PoliceManagementPage = () => {
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    policeStationId: ''
  })

  const [showFilters, setShowFilters] = useState(false)


  const [selectedPoliceId, setSelectedPoliceId] = useState(null)
  const [policeToDelete, setPoliceToDelete] = useState(null)

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'POLICE' })

  const [selectedPoliceForStation, setSelectedPoliceForStation] = useState(null)
  const [isStationModalOpen, setIsStationModalOpen] = useState(false)
  const [stationForm, setStationForm] = useState({ stationId: '' })

  const {
    police,
    policeStations,
    pagination,
    isLoading,
    error,
    updateStatus,
    deletePolice,
    assignPolice,
    transferPolice,
    invitePolice,
    policeDetails,
    isPoliceDetailsLoading,
  } = usePoliceManagement({
    page, 
    ...filters, 
    selectedPoliceId})
  
  const { stations } = usePoliceStationManagement()

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }



  const onUpdateStatus = (userId, newStatus) => {
    updateStatus.mutate({ userId, newStatus })
  }

  const handleConfirmDelete = () => {
    if (!policeToDelete) return
    deletePolice.mutate(policeToDelete, {
      onSuccess: () => {
        setPoliceToDelete(null)
      },
    })
  }

  const handleInviteInputChange = (e) => {
    setInviteForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleInviteSubmit = (e) => {
    e.preventDefault()
    invitePolice.mutate(inviteForm, {
      onSuccess: () => {
        setIsInviteModalOpen(false)
        setInviteForm({ email: '', role: 'POLICE' })
      },
    })
  }

  const handleAssignOrTransferSubmit = (e) => {
    e.preventDefault()

    if (selectedPoliceForStation.policeStationId) {
      transferPolice.mutate({ policeId: selectedPoliceForStation._id, toStationId: stationForm.stationId }, {
        onSuccess: () => {
          setIsStationModalOpen(false)
          setSelectedPoliceForStation(null)
        }
      })
    } else {
      assignPolice.mutate({ policeId: selectedPoliceForStation._id, stationId: stationForm.stationId }, {
        onSuccess: () => {
          setIsStationModalOpen(false)
          setSelectedPoliceForStation(null)
        }
      })
    }
  }

  const handleCancelStationModal = () => {
    setIsStationModalOpen(false)
    setStationForm({ stationId: '' })
    setSelectedPoliceForStation(null)
  }

  const handleOpenStationModal = (police) => {
    setSelectedPoliceForStation(police)
    setStationForm({ stationId: police.policeStationId?._id || '' })
    setIsStationModalOpen(true)
  }

  const handleStationInputChange = (e) => {
    setStationForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }



  const statuses = ['APPROVED', 'BLOCKED', 'PENDING']
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Police Management</CardTitle>
          <CardDescription>Manage police officers for your tenant.</CardDescription>
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
                        placeholder="Search by case ID, reporter name, or description..."
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
                        <label className="text-sm font-medium mb-1 block">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Statuses</option>
                          {statuses.map(status => (
                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Police Stations</label>
                        <select
                          value={filters.policeStationId}
                          onChange={(e) => handleFilterChange('policeStationId', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          {stations?.map(station => (
                            <option key={station._id} value={station._id}>{station.name}</option>
                          ))}
                        </select>
                      </div>    
      
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() => setFilters({
                            status: '',
                            policeStationId: ''
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
          {isLoading ? (
              <Loader
                text='Loading Police Officers...'
              />  
          ) : error ? (
            <ErrorState 
              title='Failed to load police officers.'
            />
          ) : police.length === 0 ? (
            <NoData 
              title="No Police Officers Found"
              description="There are currently no police officers."
            />
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-end">
                  <Badge variant="success">Total Police Officers: {pagination?.totalPolice}</Badge>
                </div>
                  <div className="space-y-3">
                    {police.map((police) => (
                      <div key={police._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <p className="font-semibold text-lg">{police.fullName}</p>
                            <Badge variant={police.status === "APPROVED" ? "success" : "destructive"}>{police.status}</Badge>
                            {police.isStationHead && <Badge variant="destructive">Station Head</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className='font-medium'>Badge Number:</span> {police.badgeNumber ?? '—'}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className='font-medium'>Police Station:</span> {police.policeStationId?.name ?? 'Unassigned'}</p>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap items-center gap-5 sm:mt-0 sm:ml-4">
                          
                          <Button 
                            size="sm" 
                            variant='success' 
                            onClick={() => handleOpenStationModal(police)}
                            >
                              {police.policeStationId ? 'Transfer Police Station' : 'Assign Police Station'}
                          </Button>
                          
                          <Button 
                            variant='outline' 
                            size="sm" 
                            onClick={() => setSelectedPoliceId(police._id)}
                            >
                              View Details
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="default" 
                            disabled={updateStatus.isPending} 
                            onClick={() => onUpdateStatus(police._id, police.status === 'APPROVED' ? 'BLOCKED' : 'APPROVED')}
                            >
                              {updateStatus.isPending ? 'Updating...' : police.status === 'APPROVED' ? 'Block' : 'Unblock'}
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            disabled={deletePolice.isPending} 
                            onClick={() => setPoliceToDelete(police._id)}
                            >
                              {deletePolice.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
              </section>
              
            </div>
          )}
        </CardContent>
      </Card> 

      {pagination && (
                <div className="mt-6 flex items-center justify-end gap-2">
                  <div className="text-sm text-muted-foreground mr-4">Page {pagination.currentPage} of {pagination.totalPages}</div>
                  <Button variant="outline" disabled={!pagination?.hasPrevPage} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
                  <Button variant="outline" disabled={!pagination?.hasNextPage} onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}>Next</Button>
                </div>
              )}   

      <PoliceDetailsModal
        open={!!selectedPoliceId}
        onClose={() => setSelectedPoliceId(null)}
        policeDetails={policeDetails}
        isLoading={isPoliceDetailsLoading}
      />
      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        open={!!policeToDelete}
        onClose={() => setPoliceToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deletePolice.isPending}
        entityName='Police Officer'
      />

      <InvitePoliceModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteSubmit}
        isSubmitting={invitePolice.isPending}
        formData={inviteForm}
        onChange={handleInviteInputChange}
      />

      <AssignOrTransferStationModal
        open={isStationModalOpen}
        onClose={handleCancelStationModal}
        onSubmit={handleAssignOrTransferSubmit}
        isSubmitting={assignPolice.isPending || transferPolice.isPending}
        formData={stationForm}
        onChange={handleStationInputChange}
        policeName={selectedPoliceForStation?.fullName}
        stations={policeStations}
        isTransfer={!!selectedPoliceForStation?.policeStationId}
      />

    </div>
  )
}

export default PoliceManagementPage
