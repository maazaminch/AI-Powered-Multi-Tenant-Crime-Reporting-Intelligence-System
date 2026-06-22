import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePoliceManagement } from '../../hooks/admin/usePoliceManagement'
import InvitePoliceModal from '../../components/features/police/modals/InvitePoliceModal'
import AssignOrTransferStationModal from '../../components/features/police/modals/AssignOrTransferStationModal'
import PoliceDetailsModal from '../../components/features/police/modals/PoliceDetailsModal'
import DeleteConfirmationModal from '../../components/features/DeleteConfirmationModal'
import { formatError } from '../../lib/utils'

const PoliceManagementPage = () => {
  const [activeTab, setActiveTab] = useState('APPROVED')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStation, setSelectedStation] = useState('')

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
  } = usePoliceManagement(page, activeTab, searchQuery, selectedStation, selectedPoliceId)


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


  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Police Management</CardTitle>
          <CardDescription>Manage police officers for your tenant.</CardDescription>

          <div className='mt-4 flex flex-wrap items-center gap-2'>
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder="Search by name or email"
              className="h-10 px-3 rounded-md border"
            />

            <select value={selectedStation} onChange={(e) => { setSelectedStation(e.target.value); setPage(1) }} className="h-10 rounded-md border px-2">
              <option value="">All Stations</option>
              <option value="UNASSIGNED">Unassigned</option>
              {policeStations?.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <div className='w-full mt-4 flex gap-2 justify-start'>
            <Button
            variant={activeTab === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('APPROVED')
              setPage(1)
            }}
            >
              Approved Police
            </Button>
            <Button
            variant={activeTab === 'BLOCKED' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('BLOCKED')
              setPage(1)
            }}
            >
              Blocked Police
            </Button>
          </div>

            <div className="ml-auto">
              <Button variant='default' onClick={() => setIsInviteModalOpen(true)}>Invite Police</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">



          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => (<div key={i} className="h-20 animate-pulse rounded-lg border bg-muted/40"/>))}</div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{formatError(error)}</div>
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{activeTab} Police</h2>
                    <p className="text-sm text-muted-foreground">Police officers in your tenant.</p>
                  </div>
                  <Badge variant="success">{pagination?.totalPolice ?? police.length}</Badge>
                </div>

                {police.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No {activeTab.toLowerCase()} police found.</div>
                ) : (
                  <div className="space-y-3">
                    {police.map((police) => (
                      <div key={police._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <p className="font-semibold text-lg">{police.fullName}</p>
                            <Badge variant="success">{police.status}</Badge>
                            {police.isStationHead && <Badge variant="destructive">Station Head</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className='font-medium'>Badge Number:</span> {police.badgeNumber ?? '—'}</p>
                          <p className="text-sm text-muted-foreground"><span className='font-medium'>Police Station:</span> {police.policeStationId?.name ?? 'Unassigned'}</p>
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
                )}
              </section>
              {pagination && (
                <div className="mt-6 flex items-center justify-end gap-2">
                  <div className="text-sm text-muted-foreground mr-4">Page {pagination.currentPage} of {pagination.totalPages}</div>
                  <Button variant="outline" disabled={!pagination?.hasPrevPage} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Previous</Button>
                  <Button variant="outline" disabled={!pagination?.hasNextPage} onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}>Next</Button>
                </div>
              )}
            </div>
          )}

                               
          
        </CardContent>
      </Card>
    </div>
  )
}

export default PoliceManagementPage
