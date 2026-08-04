import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Search, 
  FileText, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Home,
  Shield,
  Clock
} from 'lucide-react'
import { useTrackCase } from '../../hooks/public/useGuestReport'
import { toast } from 'sonner'

const PublicTrackPage = () => {
  const navigate = useNavigate()
  const trackCase = useTrackCase()

  const [formData, setFormData] = useState({
    caseId: '',
    trackingToken: ''
  })

  const handleTrack = async () => {
    if (!formData.caseId.trim() || !formData.trackingToken.trim()) {
      toast.error('Please enter Case ID and Tracking Token')
      return
    }

    try {
      await trackCase.mutateAsync({
        caseId: formData.caseId.trim(),
        trackingToken: formData.trackingToken.trim()
      })
      // Navigate to case details page with caseId and token as query params
      navigate(`/public/case-details/${formData.caseId.trim()}?token=${formData.trackingToken.trim()}`)
    } catch (error) {
      // Error handled by mutation
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'pink'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    Track Your Case
                  </CardTitle>
                  <CardDescription>
                    Enter your Case ID and Tracking Token to check status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Case ID *</label>
                <Input
                  type="text"
                  value={formData.caseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, caseId: e.target.value }))}
                  placeholder="Enter your Case ID (e.g., CR-XXXXXXXX)"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tracking Token *</label>
                <Input
                  type="text"
                  value={formData.trackingToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingToken: e.target.value }))}
                  placeholder="Enter your Tracking Token"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  The 24-character token you received when reporting the case
                </p>
              </div>

              <Button
                onClick={handleTrack}
                disabled={trackCase.isPending}
                className="w-full"
              >
                {trackCase.isPending ? 'Searching...' : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Case
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => navigate('/public/report')}
                  className="text-sm"
                >
                  Report a new case
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PublicTrackPage
