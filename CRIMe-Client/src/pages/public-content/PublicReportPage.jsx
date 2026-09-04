import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import LocationPicker from '../../components/map/LocationPicker'
import OTPVerification from '../../components/guest/OTPVerification'
import { GuestCaseReportedSuccessModal } from '../../components/features/public/modals/GuestCaseReportedSuccessModal'
import { useSendOTP, useVerifyOTP, useGuestReportCase, useGuestSuggestStations } from '../../hooks/public/useGuestReport'
import { usePDF } from '../../hooks/usePDF'
import { uploadService } from '../../services/uploadService'
import {
  AlertTriangle,
  Mail,
  User,
  Phone,
  FileText,
  Upload,
  CheckCircle,
  X,
  Building2,
  ArrowRight,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

const PublicReportPage = () => {
  const navigate = useNavigate()
  const sendOTP = useSendOTP()
  const verifyOTP = useVerifyOTP()
  const reportCase = useGuestReportCase()
  const suggestStations = useGuestSuggestStations()
  const { guestDownloadReceipt, isGuestDownloadingReceipt } = usePDF()

  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState('')
  const [otp, setOtp] = useState('')

  // Step 1: Email
  const [email, setEmail] = useState('')

  // Step 3: Guest Info + Case Details (merged)
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: ''
  })

  const [caseData, setCaseData] = useState({
    crimeType: '',
    description: '',
    coordinates: null,
    locationLabel: '',
    address: '',
    policeStationId: '',
    evidenceFileIds: []
  })

  const [nearestStations, setNearestStations] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedCaseData, setSubmittedCaseData] = useState({ caseId: null, trackingToken: null })

  const crimeTypes = [
    'THEFT', 'ROBBERY', 'ASSAULT', 'MURDER', 'DOMESTIC_VIOLENCE',
    'CYBER_CRIME', 'KIDNAPPING', 'FRAUD', 'DRUG_OFFENSE',
    'HARASSMENT', 'TRAFFIC_VIOLATION', 'OTHER'
  ]

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email')
      return
    }
    
    try {
      const result = await sendOTP.mutateAsync(email)
      setSessionId(result.sessionId)
      setStep(2)
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (otpValue) => {
    try {
      await verifyOTP.mutateAsync({ sessionId, otp: otpValue })
      setOtp(otpValue)
      setStep(3)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleResendOTP = async () => {
    try {
      const result = await sendOTP.mutateAsync(email)
      setSessionId(result.sessionId)
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Location handling
  const handleLocationSelect = (location) => {
    setCaseData(prev => ({
      ...prev,
      coordinates: location.coordinates,
      locationLabel: location.display_name || location.label || '',
      address: ''
    }))

    if (location.coordinates) {
      const [lng, lat] = location.coordinates
      suggestStations.mutate(
        { lng, lat },
        {
          onSuccess: (data) => {
            const stations = data.stations || []
            setNearestStations(stations)
            if (stations.length > 0) {
              setCaseData(prev => ({
                ...prev,
                policeStationId: stations[0]._id
              }))
            }
          },
          onError: (error) => {
            console.error('Failed to fetch stations:', error)
            toast.error('Failed to fetch nearby stations')
          }
        }
      )
    }
  }

  // File upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setIsUploading(true)
    const fileIds = []

    try {
      for (const file of files) {
        const filename = `evidence/${Date.now()}-${file.name}`
        const { data: uploadData } = await uploadService.getPublicProfileUploadUrl(filename, file.type)
        await uploadService.uploadFileToS3(uploadData.uploadUrl, file)
        fileIds.push(filename)
        setUploadedFiles(prev => [...prev, { name: file.name, id: filename }])
      }

      setCaseData(prev => ({
        ...prev,
        evidenceFileIds: [...prev.evidenceFileIds, ...fileIds]
      }))

      toast.success('Files uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload files')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    setCaseData(prev => ({
      ...prev,
      evidenceFileIds: prev.evidenceFileIds.filter(id => id !== fileId)
    }))
  }

  // Step 3: Submit Case
  const handleSubmitCase = async () => {
    if (!guestInfo.name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!guestInfo.phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }
    if (!caseData.crimeType) {
      toast.error('Please select a crime type')
      return
    }
    if (!caseData.description.trim()) {
      toast.error('Please provide a description')
      return
    }
    if (!caseData.coordinates) {
      toast.error('Please select a location on the map')
      return
    }

    try {
      const result = await reportCase.mutateAsync({
        sessionId,
        otp,
        name: guestInfo.name,
        phone: guestInfo.phone,
        email,
        ...caseData
      })

      setSubmittedCaseData({
        caseId: result.caseId,
        trackingToken: result.trackingToken
      })
      setShowSuccessModal(true)
      toast.success('Case reported successfully')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDownloadReceipt = () => {
    if (submittedCaseData.caseId && submittedCaseData.trackingToken) {
      guestDownloadReceipt({
        caseId: submittedCaseData.caseId,
        trackingToken: submittedCaseData.trackingToken
      })
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate('/public')
  }

  const steps = [
    { number: 1, title: 'Email Verification' },
    { number: 2, title: 'OTP Verification' },
    { number: 3, title: 'Report Details' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
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
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <AlertTriangle className="w-6 h-6" />
                    Public Crime Report
                  </CardTitle>
                  <CardDescription>
                    Report a crime without login
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Progress Steps */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <React.Fragment key={s.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step > s.number ? '✓' : s.number}
                    </div>
                    <span className={`text-xs mt-2 ${
                      step >= s.number ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step > s.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Email Verification */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Mail className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Verify Your Email</h3>
                    <p className="text-muted-foreground">
                      We'll send a verification code to your email to confirm your identity
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                    />
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={sendOTP.isPending}
                    className="w-full"
                  >
                    {sendOTP.isPending ? 'Sending...' : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <OTPVerification
                    email={email}
                    sessionId={sessionId}
                    onVerify={handleVerifyOTP}
                    onResendOTP={handleResendOTP}
                    isSendingOTP={sendOTP.isPending}
                    isVerifying={false}
                  />
                </motion.div>
              )}

              {/* Step 3: Guest Info + Case Details (merged) */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Guest Information Section */}
                  <div className="border-b pb-6">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Your Information
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Please provide your contact details
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <Input
                          type="text"
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <Input
                          type="tel"
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          value={email}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Case Details Section */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Case Details
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Provide details about the incident
                    </p>

                    <div className="space-y-4">
                      {/* Crime Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Crime Type *</label>
                        <select
                          value={caseData.crimeType}
                          onChange={(e) => setCaseData(prev => ({ ...prev, crimeType: e.target.value }))}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select crime type</option>
                          {crimeTypes.map(type => (
                            <option key={type} value={type}>{type.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                          value={caseData.description}
                          onChange={(e) => setCaseData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the incident in detail..."
                          rows={5}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Incident Location *</label>
                        <LocationPicker 
                          onChange={handleLocationSelect}
                          value={caseData.coordinates 
                            ? [caseData.coordinates[1], caseData.coordinates[0]] 
                            : null
                          }
                        />
                        {caseData.locationLabel && (
                          <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>{caseData.locationLabel}</span>
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Address (Optional)</label>
                        <input
                          type="text"
                          value={caseData.address}
                          onChange={(e) => setCaseData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter specific address details (street, house number, etc.)"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Police Station */}
                      {caseData.policeStationId && nearestStations.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Assigned Police Station</label>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Building2 className="w-4 h-4" />
                            <span>{nearestStations[0].name} - {nearestStations[0].address}</span>
                            <span className="text-xs text-muted-foreground">
                              ({nearestStations[0].distance} km away)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Evidence Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Evidence Files (Optional)</label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            accept="image/*,.pdf,.doc,.docx"
                            className="hidden"
                            id="guest-evidence-upload"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="guest-evidence-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {isUploading ? 'Uploading...' : 'Click to upload evidence files'}
                            </span>
                          </label>

                          {uploadedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {uploadedFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{file.name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(file.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitCase}
                      disabled={reportCase.isPending || isUploading}
                      className="flex-1"
                    >
                      {reportCase.isPending ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Success Modal */}
        <GuestCaseReportedSuccessModal
          open={showSuccessModal}
          onClose={handleSuccessModalClose}
          onDownloadReceipt={handleDownloadReceipt}
          caseId={submittedCaseData.caseId}
          trackingToken={submittedCaseData.trackingToken}
          isDownloading={isGuestDownloadingReceipt}
        />
      </div>
    </motion.div>
  )
}

export default PublicReportPage
