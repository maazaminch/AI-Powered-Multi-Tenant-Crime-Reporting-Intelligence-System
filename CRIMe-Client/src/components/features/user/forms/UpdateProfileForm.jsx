import React, { useRef } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Camera } from 'lucide-react'
import { Badge } from '../../../ui/Badge'
import { Separator } from '../../../ui/Separator'

const UpdateProfileForm = ({
  user,
  formData,
  isEditing,
  onChange,
  onEdit,
  onCancel,
  onSave,
  isPending,
  fileInputRef,
  onProfilePicClick,
  onFileChange
}) => {
  const isCitizen = user?.role === 'CITIZEN'

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600">Manage your account information</p>
        </div>
        {!isEditing ? (
          <button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onCancel} className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-md">
              Cancel
            </button>
            <button 
              onClick={onSave} 
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="border border-slate-200 rounded-lg shadow-sm bg-white">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.profilePictureUrl ? (
                <img
                  src={formData.profilePictureUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 cursor-pointer"
                  onClick={onProfilePicClick}
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                  onClick={onProfilePicClick}
                >
                  <User className="w-10 h-10 text-slate-400" />
                </div>
              )}
              {isEditing && (
                <div 
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700"
                  onClick={onProfilePicClick}
                >
                  <Camera className="w-3 h-3 text-white" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user?.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                  {user?.role}
                </Badge>
                {user?.isSuperAdmin && (
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                    Super Admin
                  </Badge>
                )}
                {user?.isStationHead && (
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    Station Head
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200" />
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{user?.fullName}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    disabled={!isCitizen}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isCitizen ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{user?.email}</span>
                  </div>
                )}
                {!isCitizen && (
                  <p className="text-xs text-slate-500 mt-1">Only citizens can change email</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900">{user?.phone}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Phone cannot be changed</p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{user?.gender}</span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">
                      {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900">{user?.age || 'Not calculated'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{user?.address || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <Badge className={
                  user?.status === 'APPROVED' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : user?.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }>
                  {user?.status}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UpdateProfileForm
