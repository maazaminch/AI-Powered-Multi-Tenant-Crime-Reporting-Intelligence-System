import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  MessageSquare,
  FileIcon,
  Shield
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useCaseDetails } from '../../hooks/police/useCaseDetails'
import { AddNoteModal } from '../../components/features/shared/modals/AddNoteModal'
import { AddStatementModal } from '../../components/features/shared/modals/AddStatementModal'
import { AddArrestModal } from '../../components/features/shared/modals/AddArrestModal'
import { UpdateStatusModal } from '../../components/features/police/modals/UpdateStatusModal'
import LocationView from '../../components/map/LocationView'

const CaseDetailsPage = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [showAddNote, setShowAddNote] = useState(false)
  const [showAddStatement, setShowAddStatement] = useState(false)
  const [showAddArrest, setShowAddArrest] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)

  const { 
    caseDetails, 
    updates, 
    detailsLoading, 
    updatesLoading, 
    detailsError, 
    updatesError,
    refetchDetails, 
    refetchUpdates,
    addUpdateMutation,
    updateStatusMutation
  } = useCaseDetails(caseId)

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'UNDER_INVESTIGATION': 'bg-purple-100 text-purple-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'CLOSED': 'bg-gray-100 text-gray-800',
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
    await addUpdateMutation.mutateAsync(data)
    setShowAddNote(false)
  }

  const handleAddStatement = async (data) => {
    await addUpdateMutation.mutateAsync(data)
    setShowAddStatement(false)
  }

  const handleAddArrest = async (data) => {
    await addUpdateMutation.mutateAsync(data)
    setShowAddArrest(false)
  }

  const handleStatusUpdate = async (data) => {
    await updateStatusMutation.mutateAsync(data)
    setShowStatusUpdate(false)
  }

  const allowedStatusTransitions = {
    'ASSIGNED': ['UNDER_INVESTIGATION'],
    'UNDER_INVESTIGATION': ['RESOLVED']
  }

  const getNextStatuses = () => {
    return allowedStatusTransitions[caseDetails?.status] || []
  }

  if (detailsLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading case details...</p>
        </div>
      </motion.div>
    )
  }

  if (detailsError || !caseDetails) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <Card className="max-w-md border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Case Not Found</h3>
              <p className="text-slate-600 mb-4">The case you're looking for doesn't exist or you don't have access to it.</p>
              <Button onClick={() => navigate('/police/cases')} variant="outline" className="border-2">
                Back to Cases
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-10">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => navigate('/police/cases')}
                variant="default"
                className="w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">Case ID: {caseDetails.caseId}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Created on {new Date(caseDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Case Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
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

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Location:</span>
                  <span>{caseDetails.addressText || 'Location not specified'}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
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
          </motion.div>

          {/* Reporter Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
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
                    <p className="font-medium text-base">{caseDetails.reporter?.name || 'Anonymous'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">Email</p>
                    <p className="font-medium text-base">{caseDetails.reporter?.email || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">Phone</p>
                    <p className="font-medium text-base">{caseDetails.reporter?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assigned Officer */}
          {caseDetails.assignedTo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
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
            </motion.div>
          )}

          {/* Evidence */}
          {caseDetails.evidenceFiles && caseDetails.evidenceFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
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
            </motion.div>
          )}
        </div>
          
        {/* Sidebar - Timeline */}
        {/* <div className="space-y-8"> */}
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="space-y-8"
          >
            <Card className="border border-slate-400">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setShowAddNote(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setShowAddStatement(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Add Statement
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setShowAddArrest(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Record Arrest
                    </Button>
                  </motion.div>
                  {getNextStatuses().length > 0 && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setShowStatusUpdate(true)}
                        variant="success"
                        className="w-full justify-start"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          
            <Card className="border border-slate-400">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Case Timeline</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowAddNote(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="max-h-[500px] overflow-y-auto pr-2">
                  {updatesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : updates && updates.length > 0 ? (
                    Object.entries(groupUpdatesByDate(updates)).map(([date, dateUpdates]) => (
                      <div key={date} className="mb-6">
                        <div className="sticky top-0 bg-white z-20 py-3 border-b mb-4 shadow-sm">
                          <p className="text-sm font-semibold text-muted-foreground">{date}</p>
                        </div>
                        <div className="space-y-4">
                          {dateUpdates.map((update, index) => (
                            <div key={index} className="relative pl-6 pb-4 border-l-2 border-muted last:border-0">
                              <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${getUpdateTypeColor(update.updateType)}`}>
                                {getUpdateTypeIcon(update.updateType)}
                              </div>
                              <div className="mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {update.updateType.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(update.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium">
                                {update.updatedBy?.fullName || 'System'}
                              </p>
                              {update.remarks && (
                                <p className="text-sm text-muted-foreground mt-1">{update.remarks}</p>
                              )}
                              {update.note && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                  <p className="font-medium text-blue-900">Note:</p>
                                  <p className="text-blue-800">{update.note}</p>
                                </div>
                              )}
                              {update.statement && (
                                <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                                  <p className="font-medium text-purple-900">Statement:</p>
                                  <p className="text-purple-800">{update.statement}</p>
                                  {update.witnessName && (
                                    <p className="text-xs text-purple-600 mt-1">Witness: {update.witnessName}</p>
                                  )}
                                </div>
                              )}
                              {update.arrest && (
                                <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                                  <p className="font-medium text-red-900">Arrest:</p>
                                  <p className="text-red-800">{update.arrest.name || update.arrest.arrestedPersonName}</p>
                                  <p className="text-xs text-red-600 mt-1">Reason: {update.arrest.charges || update.arrest.arrestReason}</p>
                                </div>
                              )}
                              {update.previousStatus && update.newStatus && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                  <Badge className={getStatusColor(update.previousStatus)}>
                                    {update.previousStatus}
                                  </Badge>
                                  <span>→</span>
                                  <Badge className={getStatusColor(update.newStatus)}>
                                    {update.newStatus}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      No updates yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      {/* Modals */}
      <AddNoteModal
        open={showAddNote}
        onClose={() => setShowAddNote(false)}
        onAddNote={handleAddNote}
        isAdding={addUpdateMutation.isPending}
      />

      <AddStatementModal
        open={showAddStatement}
        onClose={() => setShowAddStatement(false)}
        onAddStatement={handleAddStatement}
        isAdding={addUpdateMutation.isPending}
      />

      <AddArrestModal
        open={showAddArrest}
        onClose={() => setShowAddArrest(false)}
        onAddArrest={handleAddArrest}
        isAdding={addUpdateMutation.isPending}
      />

      <UpdateStatusModal
        open={showStatusUpdate}
        onClose={() => setShowStatusUpdate(false)}
        onUpdateStatus={handleStatusUpdate}
        isUpdating={updateStatusMutation.isPending}
        currentStatus={caseDetails?.status}
      />
    </motion.div>
  )
}

export default CaseDetailsPage
