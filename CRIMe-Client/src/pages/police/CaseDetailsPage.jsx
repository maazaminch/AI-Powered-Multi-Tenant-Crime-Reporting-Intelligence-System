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
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={() => navigate('/police/cases')}
                    variant="outline"
                    size="icon"
                    className="border-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    {caseDetails.caseId}
                  </CardTitle>
                  <CardDescription>
                    Case Details and Timeline
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(caseDetails.status)}>
                  {caseDetails.status.replace('_', ' ')}
                </Badge>
                <Badge className={getSeverityColor(caseDetails.severity)}>
                  {caseDetails.severity}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Case Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Case Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Description</h4>
                <p className="text-slate-600">{caseDetails.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Crime Type</h4>
                <Badge variant="outline" className="border-2">
                  {caseDetails.crimeType?.replace('_', ' ') || 'Unknown'}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Location</h4>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {caseDetails.location?.address || 'Not specified'}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Reported Date</h4>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(caseDetails.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Reporter</h4>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  {caseDetails.reporter?.name || 'Anonymous'}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Assigned To</h4>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  {caseDetails.assignedTo?.fullName || 'Not assigned'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowAddNote(true)}
                  variant="outline"
                  className="border-2"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowAddStatement(true)}
                  variant="outline"
                  className="border-2"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Statement
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowAddArrest(true)}
                  variant="outline"
                  className="border-2"
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
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Case Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {updatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : updates && updates.length > 0 ? (
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <motion.div
                    key={update._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getUpdateTypeColor(update.updateType)}`}>
                        {getUpdateTypeIcon(update.updateType)}
                      </div>
                      {index < updates.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">
                          {update.updateType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {update.note && (
                        <p className="text-slate-600 text-sm">{update.note}</p>
                      )}
                      {update.statement && (
                        <p className="text-slate-600 text-sm">{update.statement}</p>
                      )}
                      {update.arrest && (
                        <div className="text-slate-600 text-sm">
                          <p><strong>Arrested:</strong> {update.arrest.name}</p>
                          <p><strong>Charges:</strong> {update.arrest.charges}</p>
                        </div>
                      )}
                      {update.previousStatus && update.newStatus && (
                        <div className="text-slate-600 text-sm">
                          Status changed from {update.previousStatus} to {update.newStatus}
                        </div>
                      )}
                      {update.remarks && (
                        <p className="text-slate-500 text-sm italic">{update.remarks}</p>
                      )}
                      <div className="text-xs text-slate-400 mt-1">
                        By: {update.updatedBy?.fullName || 'Unknown'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600">
                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p>No updates yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

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
