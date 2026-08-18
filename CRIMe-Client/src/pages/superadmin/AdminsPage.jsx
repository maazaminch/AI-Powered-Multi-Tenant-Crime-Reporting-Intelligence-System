import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAdminsManagement } from '../../hooks/superadmin/useAdminsManagement'
import { useAdminsDetails } from '../../hooks/superadmin/useAdminDetails'

import InviteAdminForm from '../../components/features/admin/forms/InviteAdminForm'
import AssignOrTransferAdminForm from '../../components/features/admin/forms/AssignOrTransferAdminForm'
import AdminDetailsModal from '../../components/features/admin/modals/AdminDetailsModals'
import SearchDropdown from '../../components/common/SearchDropdown'

import Loader from '../../components/ui/feedback/Loader';
import ErrorState from '../../components/ui/feedback/ErrorState';
import NoData from '../../components/ui/feedback/NoData';


import { 
  FileText, 
  Search, 
  Filter, 
  ChevronDown,

} from 'lucide-react'

const AdminsPage = () => {

  const [selectedAdminId, setSelectedAdminId] = useState(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'ADMIN' })

  const [selectedTenantAdmin, setSelectedTenantAdmin] = useState(null)
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false)
  const [tenantForm, setTenantForm] = useState({ tenantId: '' })

  const [filters, setFilters] = useState({
    page: 1,

    search: '',
    status: '',
    tenantId: ''
  })

  const [showFilters, setShowFilters] = useState(false)

    const {
      admins,
      tenants,
      totalAdmins,
      pagination,
      isLoading,
      error,
      statusMutation,
      deleteMutation,
      assignMutation,
      transferMutation,
      inviteMutation,
    } = useAdminsManagement(filters)

    const tenantOptions = [
      {
        value: "",
        label: "All Tenants",
      },
      {
        value: "UNASSIGNED",
        label: "Unassigned",
      },
      ...tenants.map((tenant) => ({
        value: tenant._id,
        label: tenant.name,
      })),
    ];


  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }  
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6"/>
            Admin Management
          </CardTitle>
          <CardDescription>
            Manage all Admins. Use the action buttons to manage them.
          </CardDescription>

          <Button
              className='ml-auto justify-end'
              variant="success"
              onClick={() => setIsInviteModalOpen(true)}>
              Invite Admin
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
                
               
              <SearchDropdown
                value={filters.tenantId}
                options={tenantOptions}
                onChange={(value) => handleFilterChange("tenantId", value)}
                placeholder="All Tenants"
                searchPlaceholder="Search tenants..."
                emptyMessage="No tenant found."
              />

                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 h-10 border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="APPROVED">Active</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
                

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      page: 1,
                      search: '',
                      status: '',
                      tenantId: ''
                    })}
                    className="w-full h-10 px-3"
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
            <h3 className="text-lg font-semibold">All Admins</h3>

            

            <Badge variant="success">Total Admins: {totalAdmins}</Badge>
            
          </div>
          
          {isLoading ? (
            <Loader 
              text='Loading Admins'
              fullScreen
            />
          ) : error ? (
            <ErrorState 
              title='Error Loading Admins'
            />
          ) : admins.length === 0 ? (
            <NoData 
              title='No Admin found'
            />      
          ) : (
                  <div className="space-y-3">
                    {admins.map((admin) => (
                      <div key={admin._id} className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <p className="font-semibold text-lg">{admin.fullName}</p>
                            <Badge variant={admin.status === 'APPROVED' ? 'success' : 'destructive'}>
                              {admin.status }
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Tenant:</span> {admin.tenantId?.name ?? 'Unassigned'}
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

        <AdminDetailsModal
          adminId={selectedAdminId}
          open={!!selectedAdminId}
          onClose={() => setSelectedAdminId(null)}
        />

      </Card>
    </div>
  )
}

export default AdminsPage
