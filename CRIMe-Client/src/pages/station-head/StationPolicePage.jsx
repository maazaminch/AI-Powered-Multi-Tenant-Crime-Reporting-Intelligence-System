import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStationPolice, usePoliceDetails } from '../../hooks/stationHead/useStationPolice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatError } from '../../lib/utils'
import StationPoliceDetailsModal from '../../components/features/stationHead/modals/StationPoliceDetailsModal'
import { Shield, Badge as BadgeIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const StationPolicePage = () => {
  const [page, setPage] = useState(1)
  const { police, pagination, isLoading, error } = useStationPolice(page)
  const [selectedPoliceId, setSelectedPoliceId] = useState(null)
  const navigate = useNavigate()

  const handlePoliceClick = (policeId) => {
    setSelectedPoliceId(policeId)
  }

  const handleCaseClick = (caseId) => {
    navigate(`/station-head/case-details/${caseId}`)
  }

  const getOnDutyBadge = (status) => {
    return status === 'ON_DUTY' ? (
      <Badge variant="success" className="gap-1">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        On Duty
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        Off Duty
      </Badge>
    )
  }

  const selectedPolice = police.find(p => p._id === selectedPoliceId)
  const { policeDetails, isLoading: isDetailsLoading } = usePoliceDetails(selectedPoliceId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Station Police
          </CardTitle>
          <CardDescription>
            View all officers assigned to this station and their performance metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Police List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-lg border bg-muted/40" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formatError(error)}
            </div>
          ) : police.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground text-center">
              No police officers assigned to this station yet
            </div>
          ) : (
            <div className="space-y-3">
              {police.map((officer) => (
                <div 
                  key={officer._id} 
                  className="rounded-lg border bg-card p-4 sm:flex sm:items-center sm:justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handlePoliceClick(officer._id)}
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="font-semibold text-lg">{officer.fullName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BadgeIcon className="w-3 h-3" />
                        {officer.badgeNumber}
                      </div>
                      {getOnDutyBadge(officer.onDutyStatus)}
                    </div>
                    
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Active Cases:</span> {officer.activeCasesCount}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Resolved This Month:</span> {officer.resolvedThisMonth}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Avg Resolution Time:</span> {officer.avgResolutionTime} days
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-end gap-2">
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

      {/* Police Details Modal */}
      {selectedPolice && (
        <StationPoliceDetailsModal 
          police={selectedPolice}
          policeDetails={policeDetails}
          isLoading={isDetailsLoading}
          onClose={() => setSelectedPoliceId(null)}
          onCaseClick={handleCaseClick}
        />
      )}
    </div>
  )
}

export default StationPolicePage
