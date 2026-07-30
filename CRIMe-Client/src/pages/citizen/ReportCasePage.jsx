import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'
import { useReportCase, useSuggestNearestStations } from '../../hooks/citizen/useReportCase'
import LocationPicker from '../../components/map/LocationPicker'
import { uploadService } from '../../services/uploadService'
import { 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle,
  X,
  Building2,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

const ReportCasePage = () => {
  const navigate = useNavigate()
  const reportCase = useReportCase()
  const suggestStations = useSuggestNearestStations()

  const [formData, setFormData] = useState({
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

  const crimeTypes = [
    'THEFT', 'ROBBERY', 'ASSAULT', 'MURDER', 'DOMESTIC_VIOLENCE',
    'CYBER_CRIME', 'KIDNAPPING', 'FRAUD', 'DRUG_OFFENSE',
    'HARASSMENT', 'TRAFFIC_VIOLATION', 'OTHER'
  ]

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      coordinates: location.coordinates,
      locationLabel: location.display_name || location.label || '',
      address: location.address || location.display_name || ''
    }))

    // Fetch nearest stations when location is selected
    if (location.coordinates) {
      const [lng, lat] = location.coordinates
      suggestStations.mutate(
        { lat, lng },
        {
          // onSuccess: (data) => {
          //   console.log('Stations response:', data)
          //   // Handle new location service response format
          //   setNearestStations(data.stations || [])
          // },
          onSuccess: (data) => {
            console.log('Stations response:', data)
            const stations = data.stations || []
            setNearestStations(stations)
            
            // Auto-select the nearest station (first one, already sorted by distance)
            if (stations.length > 0) {
              setFormData(prev => ({
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

      setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      evidenceFileIds: prev.evidenceFileIds.filter(id => id !== fileId)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.crimeType) {
      toast.error('Please select a crime type')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Please provide a description')
      return
    }
    if (!formData.coordinates) {
      toast.error('Please select a location on the map')
      return
    }
    if (!formData.policeStationId) {
      toast.error('Please select a police station')
      return
    }

    try {
      await reportCase.mutateAsync(formData)
      toast.success('Case reported successfully')
      navigate('/citizen/cases')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getSeverityColor = (type) => {
    const severeTypes = ['MURDER', 'KIDNAPPING', 'ASSAULT', 'ROBBERY']
    if (severeTypes.includes(type)) return 'destructive'
    const mediumTypes = ['THEFT', 'FRAUD', 'DRUG_OFFENSE', 'CYBER_CRIME']
    if (mediumTypes.includes(type)) return 'warning'
    return 'secondary'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/citizen/cases')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertTriangle className="w-6 h-6" />
                  Report a Crime
                </CardTitle>
                <CardDescription>
                  Submit a crime report to the nearest police station
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Crime Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Crime Type *</label>
                <select
                  value={formData.crimeType}
                  onChange={(e) => setFormData(prev => ({ ...prev, crimeType: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the incident in detail..."
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Incident Location *</label>
                <div className="space-y-3">
                  <LocationPicker 
                    onChange={handleLocationSelect}
                    value={formData.coordinates 
                      ? [formData.coordinates[1], formData.coordinates[0]] 
                      : null
                    }
                  />
                  {formData.locationLabel && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{formData.locationLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">Address (Optional)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter specific address details..."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Police Station - Auto-selected */}
              {formData.policeStationId && nearestStations.length > 0 && (
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
                    id="evidence-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="evidence-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploading ? 'Uploading...' : 'Click to upload evidence files'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Images, PDF, DOC, DOCX (Max 10MB each)
                    </span>
                  </label>
                </div>

                {/* Uploaded Files */}
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

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="default"
                  className="flex-1"
                  disabled={reportCase.isPending || isUploading}
                >
                  {reportCase.isPending ? (
                    <>
                      <Loader className="w-4 h-4 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/citizen/cases')}
                  disabled={reportCase.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default ReportCasePage
