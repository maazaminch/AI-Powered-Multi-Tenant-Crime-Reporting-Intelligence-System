import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/Card'
import { useAuth } from '../../../hooks/useAuth'
import uploadService from '../../../services/uploadService'

const RegisterForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('token')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    idType: '',
    nationalIdHash: ''
  })

  const { register, error, clearError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  const [profilePic, setProfilePic] = useState(null)
  const [profilePicPreview, setProfilePicPreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) clearError()
    if (localError) setLocalError('')
  }

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPEG, or WebP image')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setProfilePic(file)
    setProfilePicPreview(URL.createObjectURL(file))

    // Upload to S3
    setIsUploading(true)
    try {
      const uploadResponse = await uploadService.getPublicProfileUploadUrl(file.name, file.type)
      const { uploadUrl, key } = uploadResponse.data.data

      await uploadService.uploadFileToS3(uploadUrl, file)

      setFormData(prev => ({ ...prev, profilePictureStorageKey: key }))
      toast.success('Profile picture uploaded successfully')
    } catch (error) {
      console.error('Profile picture upload failed:', error)
      toast.error('Failed to upload profile picture')
      setProfilePic(null)
      setProfilePicPreview('')
      setFormData(prev => ({ ...prev, profilePictureStorageKey: '' }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setLocalError('')
    try {
      if (inviteToken) {
        const res = await registerWithInvite(inviteToken, formData)
        toast.success(res?.message || 'Account created successfully. Please sign in.')
      } else {
        const res = await register(formData)
        toast.success(res?.message || 'Account created successfully. Please sign in.')
      }
      navigate('/login')
    } catch {
      // Error is handled in useAuth hook
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = localError || error

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{inviteToken ? 'Register with Invite' : 'Citizen Registration'}</CardTitle>
        <CardDescription>
          {inviteToken ? 'Complete registration using your invite token.' : 'Create your account to report crimes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="profilePicture" className="text-sm font-medium">
              Profile Picture (Optional)
            </label>
            <div className="flex items-center gap-4">
              {profilePicPreview ? (
                <div className="relative">
                  <img
                    src={profilePicPreview}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePic(null)
                      setProfilePicPreview('')
                      setFormData(prev => ({ ...prev, profilePictureStorageKey: '' }))
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-gray-500 text-xs">No image</span>
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleProfilePicChange}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPEG, or WebP (max 5MB)
                </p>
              </div>
            </div>
            {isUploading && (
              <p className="text-sm text-blue-600">Uploading profile picture...</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth
            </label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="idType" className="text-sm font-medium">
                ID Type
              </label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select ID Type</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVER_LICENSE">Driver License</option>
                <option value="NATIONAL_ID">National ID</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="nationalIdHash" className="text-sm font-medium">
                ID Number
              </label>
              <Input
                id="nationalIdHash"
                name="nationalIdHash"
                placeholder="Enter ID number"
                value={formData.nationalIdHash}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {displayError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
              {displayError}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isUploading}
          >
            {isLoading ? 'Registering...' : isUploading ? 'Uploading...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterForm
