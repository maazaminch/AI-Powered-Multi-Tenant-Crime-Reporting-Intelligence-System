import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  CheckCircle, 
  Copy, 
  Search, 
  Home,
  FileText,
  AlertTriangle,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

const PublicSuccessPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { caseId, trackingToken } = location.state || {}

  const [copiedCaseId, setCopiedCaseId] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'caseId') {
      setCopiedCaseId(true)
      setTimeout(() => setCopiedCaseId(false), 2000)
    } else {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
    toast.success('Copied to clipboard')
  }

  const handleTrackCase = () => {
    navigate('/public/track')
  }

  const handleHome = () => {
    navigate('/')
  }

  if (!caseId || !trackingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Case Data Found</h3>
            <p className="text-muted-foreground mb-4">
              Please report a case to get your tracking information.
            </p>
            <Button onClick={handleHome}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-center gap-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="text-center">
                  <CardTitle className="text-2xl text-green-800">Case Reported Successfully!</CardTitle>
                  <CardDescription className="text-green-700">
                    Your crime report has been submitted to the police
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Case Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Case Information
              </CardTitle>
              <CardDescription>
                Save this information to track your case status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Case ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Case ID</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-50 border rounded-lg font-mono text-lg">
                    {caseId}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(caseId, 'caseId')}
                  >
                    {copiedCaseId ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Tracking Token */}
              <div>
                <label className="block text-sm font-medium mb-2">Tracking Token</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg font-mono text-sm break-all">
                    {trackingToken}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(trackingToken, 'token')}
                  >
                    {copiedToken ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ This token is required to track your case. Save it securely.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Save your Case ID and Tracking Token in a secure place</li>
                    <li>• You will need the Tracking Token to check your case status</li>
                    <li>• Do not share your Tracking Token with anyone</li>
                    <li>• The police will contact you if they need more information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleHome}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
            <Button
              onClick={handleTrackCase}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              Track Case
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PublicSuccessPage
