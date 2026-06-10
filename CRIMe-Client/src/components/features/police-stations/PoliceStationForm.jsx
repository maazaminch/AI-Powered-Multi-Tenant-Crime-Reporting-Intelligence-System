import React, { useState } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../../components/ui/Input'
import LocationPicker from '../../map/LocationPicker'

const PoliceStationForm = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData = null,
}) => {

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    location: initialData?.location || null,
    address: initialData?.address || '',
    city: initialData?.city || '',
    sector: initialData?.sector || '',
    contactNumber: initialData?.contactNumber || '',
    email: initialData?.email || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate location is selected
    if (!formData.location || !formData.location.coordinates || formData.location.coordinates.length !== 2) {
      alert('Please select a location from the map')
      return
    }
    
    onSubmit(formData)   // 🔥 send data to parent page
  }

  return (
    <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">

        <h3 className="text-lg font-semibold mb-4">
          Police Station Form
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Station Name
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter station name"
              required
            />
          </div>

            {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Address
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              required
            />
          </div>

          {/* Location (map) */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <LocationPicker
                        value={
                            formData.location
                            ? [
                                formData.location.coordinates[1],
                                formData.location.coordinates[0]
                                ]
                            : null
                        }
                        onChange={(location) => {
                            setFormData((prev) => ({
                            ...prev,
                            location
                            }))
                        }}
                        />
          </div>
          
          {/* Sector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Sector (Optional)
            </label>
            <Input
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder="Enter Sector"
      
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-1">
              City
            </label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              required
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Number
            </label>
            <Input
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email (Optional)
            </label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default PoliceStationForm