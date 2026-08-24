import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { useProfile } from '../../hooks/user/useProfile'
import ChangePasswordForm from '../../components/features/user/forms/ChangePasswordForm'

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const { changePassword } = useProfile()
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password cannot be the same as current password'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      changePassword.mutate({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      }, {
        onSuccess: () => {
          // Clear form on success
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        }
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
          <p className="text-slate-600">Update your account password</p>
        </div>
      </div>

      {/* Change Password Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Change Password
          </CardTitle>
          <CardDescription>
            Enter your current password and choose a new secure password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            isPending={changePassword.isPending}
            errors={errors}
            showPasswords={showPasswords}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-slate-200 shadow-sm bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            Security Tips
          </h4>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Use a strong password with at least 8 characters</li>
            <li>• Include uppercase, lowercase, numbers, and special characters</li>
            <li>• Don't use the same password across multiple sites</li>
            <li>• Change your password regularly</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangePasswordPage
