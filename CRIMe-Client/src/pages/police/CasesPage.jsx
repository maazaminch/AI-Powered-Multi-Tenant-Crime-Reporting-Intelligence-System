import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePoliceCases } from '../../hooks/police/usePoliceCases'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronDown,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Calendar,
  ArrowRight,
  X
} from 'lucide-react'

const CasesPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    crimeType: '',
    severity: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)

  const { cases, pagination, isLoading, error, refetch } = usePoliceCases({
    page,
    ...filters
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleCaseClick = (caseId) => {
    navigate(`/police/case-details/${caseId}`)
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

  const clearFilters = () => {
    setFilters({
      status: '',
      crimeType: '',
      severity: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'createdAt' && v !== 'desc')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6" />
              My Cases
            </CardTitle>
            <CardDescription>
              Manage and track your assigned cases
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by case ID, reporter name, or description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                </motion.div>
                {hasActiveFilters && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">All Statuses</option>
                        {statuses.map(status => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Crime Type</label>
                      <select
                        value={filters.crimeType}
                        onChange={(e) => handleFilterChange('crimeType', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">All Types</option>
                        {crimeTypes.map(type => (
                          <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                      <select
                        value={filters.severity}
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">All Severities</option>
                        {severities.map(severity => (
                          <option key={severity} value={severity}>{severity}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="createdAt">Date Created</option>
                        <option value="updatedAt">Last Updated</option>
                        <option value="severity">Severity</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cases List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                Error loading cases: {error.message}
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium">No cases found</p>
                <p className="text-sm">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <Badge variant="success" className="ml-2">
                    Total Cases: {totalCases}
                  </Badge>
                </div>
                {cases.map((caseItem, index) => (
                  <motion.div
                    key={caseItem._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    onClick={() => handleCaseClick(caseItem.caseId)}
                    className="cursor-pointer"
                  >
                    <div className="p-4 border rounded-lg hover:border-blue-400 transition-all bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-slate-800">
                              {caseItem.caseId}
                            </h3>
                            <Badge variant={getStatusColor(caseItem.status)}>
                              {caseItem.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getSeverityColor(caseItem.severity)}>
                              {caseItem.severity}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">Location:</span>
                            <span>{caseItem.addressText || 'Location not specified'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-8 sm:min-w-[150px]">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="font-medium">Assigned to you</p>
                            </div>
                          </div>

                          <Button size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCaseClick(caseItem.caseId)
                            }}
                            >
                            Case Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default CasesPage
