import React, { useState, useRef } from 'react'
import { useProfile } from '../../hooks/user/useProfile'
import UpdateProfileForm from '../../components/features/user/forms/UpdateProfileForm'
import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'

const ProfilePage = () => {
  const { user, isLoading, error, refetch, updateProfile } = useProfile()
  const fileInputRef = useRef(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profilePictureUrl: '',
    gender: '',
    dateOfBirth: '',
    address: ''
  })

  const handleProfilePicClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, you would upload this to cloud storage
      // For now, we'll just use a placeholder URL
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        profilePictureUrl: imageUrl
      }))
    }
  }

  // Initialize form data when user data loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePictureUrl: user.profilePictureUrl || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        address: user.address || ''
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to original values
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePictureUrl: user.profilePictureUrl || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        address: user.address || ''
      })
    }
  }

  const handleSave = () => {
    // Only send non-empty fields to avoid email validation issues
    const dataToSend = Object.keys(formData).reduce((acc, key) => {
      if (formData[key] !== '' && formData[key] !== undefined && formData[key] !== null) {
        acc[key] = formData[key]
      }
      return acc
    }, {})

    updateProfile.mutate(dataToSend, {
      onSuccess: () => {
        setIsEditing(false)
        refetch()
      }
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return <ErrorState message="Failed to load profile" onRetry={refetch} />
  }

  if (!user) {
    return <ErrorState message="No profile data found" />
  }

  return (
    <div className="space-y-6">
      <UpdateProfileForm
        user={user}
        formData={formData}
        isEditing={isEditing}
        onChange={handleChange}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        isPending={updateProfile.isPending}
        fileInputRef={fileInputRef}
        onProfilePicClick={handleProfilePicClick}
        onFileChange={handleFileChange}
      />
    </div>
  )
}

export default ProfilePage
