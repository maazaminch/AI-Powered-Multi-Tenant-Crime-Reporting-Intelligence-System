import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, User, FileText, AlertCircle, CheckCircle, Clock, Plus, UserPlus, Archive, MessageSquare, FileText as FileIcon, Shield } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Separator } from '../../components/ui/Separator'
import NoData from '../../components/ui/feedback/NoData'
import Loader from '../../components/ui/feedback/Loader'
import { useCaseDetails } from '../../hooks/stationHead/useCaseDetails'
import { useStationCases } from '../../hooks/stationHead/useStationCases'
import { AddNoteModal } from '../../components/features/shared/modals/AddNoteModal'
import { AddStatementModal } from '../../components/features/shared/modals/AddStatementModal'
import { AddArrestModal } from '../../components/features/shared/modals/AddArrestModal'
import { AssignCaseModal } from '../../components/features/stationHead/modals/AssignCaseModal'
import { CloseCaseModal } from '../../components/features/stationHead/modals/CloseCaseModal'
import LocationView from '../../components/map/LocationView'
import { toast } from 'sonner'
import { useStationPolice } from '../../hooks/stationHead/useStationPolice'

const CaseDetailsPage = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('timeline')
  
  // Modals state
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showStatementModal, setShowStatementModal] = useState(false)
  const [showArrestModal, setShowArrestModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  const { 
    caseDetails, 
    isLoading, 
    error, 
    updates, 
    updatesLoading,
    updatesError,
    closeCase, 
    isClosingCase, 
    addUpdate, 
    isAddingUpdate, 
    assignCase, 
    isAssigning, 
    reassignCase, 
    isReassigning 
  } = useCaseDetails(caseId)

  const { cases: stationCases } = useStationCases({ status: 'PENDING' })
  const { police } = useStationPolice()

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ASSIGNED': 'bg-blue-100 text-blue-800 border-blue-200',
      'UNDER_INVESTIGATION': 'bg-purple-100 text-purple-800 border-purple-200',
      'RESOLVED': 'bg-green-100 text-green-800 border-green-200',
      'CLOSED': 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getSeverityColor = (severity) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'CRITICAL': 'bg-red-100 text-red-800',
    }
    return colors[severity] || 'bg-gray-100 text-gray-800'
  }

  const getUpdateTypeIcon = (type) => {
    const icons = {
      'NOTE': <MessageSquare className="w-4 h-4" />,
      'STATEMENT': <FileText className="w-4 h-4" />,
      'ARREST': <Shield className="w-4 h-4" />,
      'EVIDENCE': <FileIcon className="w-4 h-4" />,
      'STATUS_UPDATE': <CheckCircle className="w-4 h-4" />,
    }
    return icons[type] || <AlertCircle className="w-4 h-4" />
  }

  const getUpdateTypeColor = (type) => {
    const colors = {
      'NOTE': 'bg-blue-100 text-blue-700',
      'STATEMENT': 'bg-purple-100 text-purple-700',
      'ARREST': 'bg-red-100 text-red-700',
      'EVIDENCE': 'bg-green-100 text-green-700',
      'STATUS_UPDATE': 'bg-yellow-100 text-yellow-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  // Group updates by date
  const groupUpdatesByDate = (updates) => {
    if (!updates || updates.length === 0) return {}
    
    return updates.reduce((groups, update) => {
      const date = new Date(update.createdAt).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(update)
      return groups
    }, {})
  }

  const handleAddNote = async (data) => {
    try {
      await addUpdate(data)
      setShowNoteModal(false)
      toast.success('Note added successfully')
    } catch (error) {
      toast.error(error.backendMessage || 'Failed to add note')
    }
  }

  const handleAddStatement = async (data) => {
    try {
      await addUpdate(data)
      setShowStatementModal(false)
      toast.success('Statement added successfully')
    } catch (error) {
      toast.error(error.backendMessage || 'Failed to add statement')
    }
  }

  const handleAddArrest = async (data) => {
    try {
      await addUpdate(data)
      setShowArrestModal(false)
      toast.success('Arrest recorded successfully')
    } catch (error) {
      toast.error(error.backendMessage || 'Failed to record arrest')
    }
  }

  const handleAssignCase = async (policeId) => {
    try {
      await assignCase(policeId)
      setShowAssignModal(false)
      toast.success('Case assigned successfully')
    } catch (error) {
      toast.error(error.backendMessage || 'Failed to assign case')
    }
  }

  const handleCloseCase = async (remarks) => {
    try {
      await closeCase({ remarks })
      setShowCloseModal(false)
      toast.success('Case closed successfully')
    } catch (error) {
      toast.error(error.backendMessage || 'Failed to close case')
    }
  }

  const handleReassignCase = async (policeId) => {
    try {
      await reassignCase(policeId)
      toast.success('Case reassigned successfully')
    } catch (error) {
      toast.error(error.backendMessage || 'Failed to reassign case')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    )
  }

  if (error || !caseDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Case</h3>
              <p className="text-muted-foreground mb-4">
                {error?.message || 'Case not found'}
              </p>
              <Button onClick={() => navigate('/station-head/station-cases')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canAssign = caseDetails.status === 'PENDING'
  const canReassign = caseDetails.status === 'ASSIGNED'
  const canClose = caseDetails.status === 'RESOLVED'
  const canAddUpdates = ['ASSIGNED', 'UNDER_INVESTIGATION'].includes(caseDetails.status)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-10">
          <Button variant="default" onClick={() => navigate('/station-head/station-cases')} className="w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Case ID: {caseDetails.caseId}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Created on {new Date(caseDetails.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {canAssign && (
            <Button onClick={() => setShowAssignModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign to Police
            </Button>
          )}
          {canReassign && (
            <Button variant="default" onClick={() => setShowAssignModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Reassign
            </Button>
          )}
          {canClose && (
            <Button variant="destructive" onClick={() => setShowCloseModal(true)}>
              <Archive className="w-4 h-4 mr-2" />
              Close Case
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Case Info Card */}
          <Card className="border border-slate-400">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-3">{caseDetails.crimeType}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getStatusColor(caseDetails.status)}>
                      Status: {caseDetails.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getSeverityColor(caseDetails.severity)}>
                      Severity: {caseDetails.severity}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(caseDetails.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">{caseDetails.description}</p>
              </div>
              
              {caseDetails.aiSummary && (
                <div className="bg-blue-50 border border-slate-200 rounded-lg p-5">
                  <h3 className="font-semibold mb-3 text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    AI Summary
                  </h3>
                  <p className="text-sm text-slate-800 leading-relaxed">{caseDetails.aiSummary}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Location:</span>
                <span>{caseDetails.addressText || 'Location not specified'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card className="border border-slate-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-5 h-5" />
                Incident Location
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <LocationView location={caseDetails.location} height={300} />
              {caseDetails.addressText && (
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {caseDetails.addressText}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reporter Info */}
          <Card className="border border-slate-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5" />
                Reporter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Name</p>
                  <p className="font-medium text-base">{caseDetails.reporter?.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Type</p>
                  <p className="font-medium text-base">{caseDetails.reporter?.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Email</p>
                  <p className="font-medium text-base">{caseDetails.reporter?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Phone</p>
                  <p className="font-medium text-base">{caseDetails.reporter?.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Officer */}
          {caseDetails.assignedTo && (
            <Card className="border border-slate-400">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="w-5 h-5" />
                  Assigned Officer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-lg">Name</p>
                    <p className="text-sm text-muted-foreground">{caseDetails.assignedTo?.fullName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-lg">Badge Number</p>
                    <p className="text-sm text-muted-foreground">{caseDetails.assignedTo?.badgeNumber}</p>
                  </div>
                  <div>
                    <p className="font-medium text-lg">Email</p>
                    <p className="text-sm text-muted-foreground">{caseDetails.assignedTo?.email}</p>
                  </div>
                  <div>
                    <p className="font-medium text-lg">Contact</p>
                    <p className="text-sm text-muted-foreground">{caseDetails.assignedTo?.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence */}
          {caseDetails.evidenceFiles && caseDetails.evidenceFiles.length > 0 && (
            <Card className="border border-slate-400">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileIcon className="w-5 h-5" />
                  Evidence Files
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {caseDetails.evidenceFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                      <FileIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{file}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline Sidebar */}
        <div className="space-y-8">

          {/* Quick Actions */}
          {canAddUpdates && (
            <Card className="border border-slate-400">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setShowStatementModal(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Statement
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setShowArrestModal(true)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Record Arrest
                </Button>
              </CardContent>
            </Card>
          )}

          
        {/* Timeline Sidebar */}
        <div className="lg:col-span-1">
          {updatesLoading ? (
            <Card className="border border-slate-400">
              <CardContent className="pt-6">
                <Loader
                  size="md"
                  text="Loading updates..."
                />
              </CardContent>
            </Card>
          ) : updatesError ? (
            <ErrorState
              title="Failed to load updates"
              description="Please try again later"
            />
          ) : updates.length === 0 ? (
            <NoData
              title="No Updates"
              description="No updates available for this case"
            />
          ) : (
            <Card className="border border-slate-400">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Case Timeline
                  </CardTitle>

                  {canAddUpdates && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNoteModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Note
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="max-h-[350px] overflow-y-auto pr-2">
                  {Object.entries(groupUpdatesByDate(updates)).map(
                    ([date, dateUpdates]) => (
                      <div key={date} className="mb-6">

                        <div className="sticky top-0 bg-white z-20 py-3 border-b mb-4 shadow-sm">
                          <p className="text-sm font-semibold text-muted-foreground">
                            {date}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {dateUpdates.map((update, index) => (
                            <div
                              key={index}
                              className="relative pl-6 pb-4 border-l-2 border-muted last:border-0"
                            >
                              <div
                                className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${getUpdateTypeColor(
                                  update.updateType
                                )}`}
                              >
                                {getUpdateTypeIcon(update.updateType)}
                              </div>

                              <div className="mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {update.updateType.replace("_", " ")}
                                </Badge>

                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(
                                    update.createdAt
                                  ).toLocaleTimeString()}
                                </span>
                              </div>

                              <p className="text-sm font-medium">
                                {update.updatedBy?.fullName || "System"}
                              </p>

                              {update.remarks && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {update.remarks}
                                </p>
                              )}

                              {update.note && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                  <p className="font-medium text-blue-900">
                                    Note:
                                  </p>
                                  <p className="text-blue-800">
                                    {update.note}
                                  </p>
                                </div>
                              )}

                              {update.statement && (
                                <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                                  <p className="font-medium text-purple-900">
                                    Statement:
                                  </p>

                                  <p className="text-purple-800">
                                    {update.statement}
                                  </p>

                                  {update.witnessName && (
                                    <p className="text-xs text-purple-600 mt-1">
                                      Witness: {update.witnessName}
                                    </p>
                                  )}
                                </div>
                              )}

                              {update.arrest && (
                                <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                                  <p className="font-medium text-red-900">
                                    Arrest:
                                  </p>

                                  <p className="text-red-800">
                                    {update.arrest.arrestedPersonName}
                                  </p>

                                  <p className="text-xs text-red-600 mt-1">
                                    Reason: {update.arrest.arrestReason}
                                  </p>
                                </div>
                              )}

                              {update.previousStatus &&
                                update.newStatus && (
                                  <div className="mt-2 flex items-center gap-2 text-sm">
                                    <Badge
                                      className={getStatusColor(
                                        update.previousStatus
                                      )}
                                    >
                                      {update.previousStatus}
                                    </Badge>

                                    <span>→</span>

                                    <Badge
                                      className={getStatusColor(
                                        update.newStatus
                                      )}
                                    >
                                      {update.newStatus}
                                    </Badge>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

          
        </div>
      </div>

      {/* Modals */}
      <AddNoteModal
        open={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onAddNote={handleAddNote}
        isAdding={isAddingUpdate}
      />

      <AddStatementModal
        open={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        onAddStatement={handleAddStatement}
        isAdding={isAddingUpdate}
      />

      <AddArrestModal
        open={showArrestModal}
        onClose={() => setShowArrestModal(false)}
        onAddArrest={handleAddArrest}
        isAdding={isAddingUpdate}
      />

      <AssignCaseModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={canReassign ? handleReassignCase : handleAssignCase}
        isAssigning={isAssigning || isReassigning}
        policeOfficers={police}
      />

      <CloseCaseModal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onCloseCase={handleCloseCase}
        isClosing={isClosingCase}
      />
    </div>
  )
}

export default CaseDetailsPage
