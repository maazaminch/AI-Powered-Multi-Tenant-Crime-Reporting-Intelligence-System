import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenantCases } from '../../hooks/admin/useTenantCases'
import { usePoliceStationManagement } from '../../hooks/admin/usePoliceStation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatError } from '../../lib/utils'
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronDown,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Calendar
} from 'lucide-react'

const TenantCasesPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)


  const [filters, setFilters] = useState({
    search: '',

    status: '',
    crimeType: '',
    severity: '',

    policeStationId: '',
    assignedTo: '',

    reporterType: '',

    startDate: '',
    endDate: '',

    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)

  const { cases, pagination, isLoading, error } = useTenantCases({
    // page,
    ...filters
  })
  const { stations } = usePoliceStationManagement()

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to page 1 when filters change
  }

  const handleCaseClick = (caseId) => {
    navigate(`/admin/case-details/${caseId}`)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'pink'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'info'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'ASSIGNED': return 'purple'
      case 'UNDER_INVESTIGATION': return 'pink'
      case 'RESOLVED': return 'success'
      case 'CLOSED': return 'info'
      default: return 'secondary'
    }
  }

  const crimeTypes = [
    'THEFT', 'ROBBERY', 'ASSAULT', 'MURDER', 'DOMESTIC_VIOLENCE',
    'CYBER_CRIME', 'KIDNAPPING', 'FRAUD', 'DRUG_OFFENSE',
    'HARASSMENT', 'TRAFFIC_VIOLATION', 'OTHER'
  ]

  const statuses = ['PENDING', 'ASSIGNED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED']
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Tenant Cases
          </CardTitle>
          <CardDescription>
            Command Center - Overview of all cases in your tenant
          </CardDescription>
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
                  <label className="text-sm font-medium mb-1 block">Reporter Type</label>
                  <select
                    value={filters.reporterType}
                    onChange={(e) => handleFilterChange('reporterType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="CITIZEN">Citizen</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </div>

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
                  <label className="text-sm font-medium mb-1 block">Crime Type</label>
                  <select
                    value={filters.crimeType}
                    onChange={(e) => handleFilterChange('crimeType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {crimeTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Severities</option>
                    {severities.map(severity => (
                      <option key={severity} value={severity}>{severity}</option>
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

                <div>
                  <label className="text-sm font-medium mb-1 block">Assigned To</label>
                  <select
                    value={filters.assignedTo}
                    onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="UNASSIGNED">Unassigned</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="severity">Severity</option>
                    <option value="status">Status</option>
                    <option value="caseId">Case ID</option>
                    <option value="crimeType">Crime Type</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Sort Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      status: '',
                      crimeType: '',
                      severity: '',
                      assignedTo: '',
                      search: '',
                      policeStationId: '',
                      reporterType: '',
                      startDate: '',
                      endDate: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
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

      {/* Cases List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-lg border bg-muted/40" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formatError(error)}
            </div>
          ) : cases.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cases found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((caseItem) => (
                <div 
                  key={caseItem._id} 
                  className="rounded-lg border bg-card p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCaseClick(caseItem.caseId)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Case Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <p className="font-semibold text-lg">{caseItem.caseId}</p>
                        <Badge variant={getStatusColor(caseItem.status)}>
                          {caseItem.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getSeverityColor(caseItem.severity)}>
                          {caseItem.severity}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Type:</span> {caseItem.crimeType.replace('_', ' ')}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Reporter:</span> {caseItem.reporter?.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Date:</span> {new Date(caseItem.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {caseItem.addressText && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{caseItem.addressText}</span>
                        </div>
                      )}

                      {/* <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {caseItem.description}
                      </p> */}
                    </div>

                    {/* Assigned Officer */}
                    <div className="flex items-center justify-between gap-8 sm:min-w-[150px]">
                      {caseItem.assignedTo ? (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{caseItem.assignedTo.fullName}</p>
                            <p className="text-xs text-muted-foreground">{caseItem.assignedTo.badgeNumber}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Unassigned</Badge>
                        </div>
                      )}

                      <Button size="sm"
                        onClick={() => handleCaseClick(caseItem.caseId)}
                        >
                        Case Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCases)} of {pagination.totalCases} cases
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={!pagination?.hasPrevPage} 
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <div className="text-sm font-medium px-3">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button 
              variant="outline" 
              disabled={!pagination?.hasNext} 
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TenantCasesPage
