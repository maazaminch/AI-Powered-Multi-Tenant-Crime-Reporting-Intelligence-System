import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { usePoliceManagement } from '../../hooks/admin/usePoliceManagement'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { usePoliceStationManagement } from '../../hooks/admin/usePoliceStation'
import InvitePoliceForm from '../../components/features/police/InvitePoliceForm'
import AssignOrTransferStationForm from '../../components/features/police/AssignOrTransferStationForm'
import { formatError } from '../../lib/utils'

const PoliceManagementPage = () => {
  const [activeTab, setActiveTab] = useState('APPROVED')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStation, setSelectedStation] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('APPROVED')

  const [selectedPoliceId, setSelectedPoliceId] = useState(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'POLICE' })

  const [selectedPoliceForStation, setSelectedPoliceForStation] = useState(null)
  const [isStationModalOpen, setIsStationModalOpen] = useState(false)
  const [stationForm, setStationForm] = useState({ stationId: '' })

  const {
    police,
    pagination,
    isLoading,
    error,
    statusMutation,
    deleteMutation,
    assignMutation,
    transferMutation,
    inviteMutation,
  } = usePoliceManagement(page, selectedStatus === 'ALL' ? undefined : selectedStatus, searchQuery, selectedStation)

  const { stations } = usePoliceStationManagement(1)

  const { data: policeDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['police-details', selectedPoliceId],
    queryFn: () => adminService.getPoliceDetails(selectedPoliceId),
    enabled: !!selectedPoliceId,
  })

  const onUpdateStatus = (userId, newStatus) => {
    statusMutation.mutate({ userId, newStatus })
  }

  const onDelete = (userId) => {
    deleteMutation.mutate(userId)
  }

  const handleInviteInputChange = (e) => {
    setInviteForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleInviteSubmit = (e) => {
    e.preventDefault()
    inviteMutation.mutate(inviteForm, {
      onSuccess: () => {
        setIsInviteModalOpen(false)
        setInviteForm({ email: '', role: 'POLICE' })
      },
    })
  }

  const handleAssignOrTransferSubmit = (e) => {
    e.preventDefault()

    if (!selectedPoliceForStation) return

    if (selectedPoliceForStation.policeStationId) {
      transferMutation.mutate({ policeId: selectedPoliceForStation._id, toStationId: stationForm.stationId }, {
        onSuccess: () => {
          setIsStationModalOpen(false)
          setSelectedPoliceForStation(null)
        }
      })
    } else {
      assignMutation.mutate({ policeId: selectedPoliceForStation._id, stationId: stationForm.stationId }, {
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
              {stations?.stations?.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1) }} className="h-10 rounded-md border px-2">
              <option value="ALL">All</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="BLOCKED">Blocked</option>
            </select>

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
                    {police.map((p) => (
                      <div key={p._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <p className="font-semibold">{p.fullName}</p>
                            <Badge variant="success">{p.role}</Badge>
                            {p.isStationHead && <Badge variant="destructive">Station Head</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">Badge: {p.badgeNumber ?? '—'}</p>
                          <p className="text-sm text-muted-foreground">Police Station: {p.policeStationId?.name ?? 'Unassigned'}</p>
                          <p className="text-sm text-muted-foreground">Email: {p.email}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-5 sm:mt-0 sm:ml-4">
                          <Button size="lg" variant='success' onClick={() => handleOpenStationModal(p)}>{p.policeStationId ? 'Transfer' : 'Assign'}</Button>
                          <Button variant='outline' size="sm" onClick={() => setSelectedPoliceId(p._id)}>View Details</Button>
                          <Button size="sm" variant="default" disabled={statusMutation.isPending} onClick={() => onUpdateStatus(p._id, p.status === 'APPROVED' ? 'BLOCKED' : 'APPROVED')}>{statusMutation.isPending ? 'Updating...' : p.status === 'APPROVED' ? 'Block' : 'Unblock'}</Button>
                          <Button size="sm" variant="destructive" disabled={deleteMutation.isPending} onClick={() => onDelete(p._id)}>{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</Button>
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

          {selectedPoliceId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Police Details</h3>
                    <p className="text-sm text-muted-foreground">Detailed police information.</p>
                  </div>
                  <button onClick={() => setSelectedPoliceId(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <div className="mt-5 space-y-4">
                  {isDetailsLoading ? (
                    <div className="space-y-3">{[1,2,3].map(i => (<div key={i} className="h-4 animate-pulse rounded bg-muted"/>))}</div>
                  ) : policeDetails ? (
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{policeDetails.fullName}</p>

                      <p className="text-xs font-semibold uppercase text-muted-foreground mt-2">Email</p>
                      <p className="text-sm font-medium">{policeDetails.email}</p>

                      <p className="text-xs font-semibold uppercase text-muted-foreground mt-2">Badge</p>
                      <p className="text-sm font-medium">{policeDetails.badgeNumber}</p>

                      <p className="text-xs font-semibold uppercase text-muted-foreground mt-2">Station</p>
                      <p className="text-sm font-medium">{policeDetails.policeStationId?.name ?? 'Unassigned'}</p>

                      <p className="text-xs font-semibold uppercase text-muted-foreground mt-2">Status</p>
                      <p className="text-sm font-medium">{policeDetails.status}</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Unable to load police details.</div>
                  )}
                </div>
                <div className="mt-6 flex justify-end"><Button variant="outline" onClick={() => setSelectedPoliceId(null)}>Close</Button></div>
              </div>
            </div>
          )}

          {isInviteModalOpen && (
            <InvitePoliceForm formData={inviteForm} onChange={handleInviteInputChange} onSubmit={handleInviteSubmit} onCancel={() => setIsInviteModalOpen(false)} isSubmitting={inviteMutation.isPending} />
          )}

          {isStationModalOpen && (
            <AssignOrTransferStationForm policeName={selectedPoliceForStation?.fullName} stations={[] /* populate stations via separate hook if needed */} formData={stationForm} onChange={handleStationInputChange} onSubmit={handleAssignOrTransferSubmit} onCancel={handleCancelStationModal} isSubmitting={assignMutation.isPending || transferMutation.isPending} isTransfer={!!selectedPoliceForStation?.policeStationId} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PoliceManagementPage
