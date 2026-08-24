import React from 'react'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '../../../ui/Button'

const ChangePasswordForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  errors,
  showPasswords,
  togglePasswordVisibility
}) => {
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: 'bg-slate-200', text: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    
    return {
      strength: (strength / 5) * 100,
      color: colors[strength - 1] || 'bg-slate-200',
      text: texts[strength - 1] || ''
    }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Current Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={onChange}
            placeholder="Enter current password"
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.currentPassword ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={onChange}
            placeholder="Enter new password"
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.newPassword ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
        )}
        
        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
              <span className="text-xs text-slate-600">{passwordStrength.text}</span>
            </div>
            <div className="mt-2 space-y-1">
              <p className={`text-xs ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>
                {formData.newPassword.length >= 8 ? <CheckCircle className="w-3 h-3 inline mr-1" /> : '•'} At least 8 characters
              </p>
              <p className={`text-xs ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                {/[a-z]/.test(formData.newPassword) ? <CheckCircle className="w-3 h-3 inline mr-1" /> : '•'} One lowercase letter
              </p>
              <p className={`text-xs ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                {/[A-Z]/.test(formData.newPassword) ? <CheckCircle className="w-3 h-3 inline mr-1" /> : '•'} One uppercase letter
              </p>
              <p className={`text-xs ${/\d/.test(formData.newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                {/\d/.test(formData.newPassword) ? <CheckCircle className="w-3 h-3 inline mr-1" /> : '•'} One number
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            placeholder="Confirm new password"
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-300 hover:bg-slate-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? 'Changing Password...' : 'Change Password'}
        </Button>
      </div>
    </form>
  )
}

export default ChangePasswordForm
