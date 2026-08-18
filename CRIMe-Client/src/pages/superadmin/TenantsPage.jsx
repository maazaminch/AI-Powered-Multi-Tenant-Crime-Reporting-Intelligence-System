import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useTenantManagement } from '../../hooks/superadmin/useTenantManagement'
import TenantForm from '../../components/features/tenant/forms/TenantForm'
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import TenantDetailsModal from '../../components/features/tenant/modals/TenantDetailsModal';

import Loader from '../../components/ui/feedback/Loader';
import ErrorState from '../../components/ui/feedback/ErrorState';
import NoData from '../../components/ui/feedback/NoData';

import { 
  FileText, 
  Search, 
  Filter, 
  ChevronDown,
} from 'lucide-react'

const TenantsPage = () => {

  const [selectedTenantId, setSelectedTenantId] = useState(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,

    search: '',
    type: '',
    isActive: undefined
  })

  const [showFilters, setShowFilters] = useState(false)

  const {
    tenants,
    totalTenants,
    pagination,
    isLoading,
    error,
    createTenant,
    deleteTenant,
    toggleTenant,
  } = useTenantManagement(filters)

  //its only for dashboard page because without using location i cannot go to the tenant form directly
  const location = useLocation()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ name: '', region: '', type: '' })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    location.state?.openCreateModal || false)
  const [tenantToDelete, setTenantToDelete] = useState(null)

  // const tenantList = tenants?.tenants ?? []

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }


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
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6"/>
            Tenant Management
          </CardTitle>
          <CardDescription>
            Manage all tenants. Use the action buttons to view details, activate, deactivate, or delete.
          </CardDescription>

          <Button
              className='ml-auto justify-end'
              variant="success"
              onClick={() => setIsCreateModalOpen(true)}>
              Create New Tenant
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
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 h-10 border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="CITY">City</option>
                    <option value="DEPARTMENT">Department</option>
                  </select>
                </div>

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
                      type: '',
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
            <h3 className="text-lg font-semibold">All Tenants</h3>

            

            <Badge variant="success">Total Tenants: {totalTenants}</Badge>
            
          </div>

          




          
          

          {isLoading ? (
            <Loader
              text='Loading Tenanats...'
              fullScreen
            />
          ) : error ? (
            <ErrorState 
              title='Error loading tenants'
            />
          ) : tenants.length === 0 ? (
            <NoData
              title='No tenants found'
            />
          ) : (
            
            <div className="space-y-3">
              {tenants.map((tenant) => (
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
                        variant={tenant.isActive ? 'success' : 'destructive'}
                      >
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Type:</span> {tenant.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Code:</span> {tenant.code ? tenant.code : 'N/A'}
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
                      variant="default"
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


      <TenantDetailsModal
                  tenantId={selectedTenantId}
                  open={!!selectedTenantId}
                  onClose={() => setSelectedTenantId(null)}
                />

                
      {isCreateModalOpen && (
            <TenantForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleCreateSubmit}
              isSubmitting={createTenant.isPending}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          )}

      <DeleteConfirmationModal
            open={!!tenantToDelete}
            onClose={() => setTenantToDelete(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={deleteTenant.isPending}
            entityName='Tenant'
          />    

            
    </div>
  )
}

export default TenantsPage
