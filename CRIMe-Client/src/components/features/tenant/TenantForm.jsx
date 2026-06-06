import React from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../../components/ui/Input'

const TenantForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  isSubmitting, 
  onCancel, 
  title = "Create New Tenant" 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant Name
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Enter tenant name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <Input
              name="region"
              value={formData.region}
              onChange={onChange}
              placeholder="Enter region"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
                id="type"
                name="type"
                value={formData.type}
                onChange={onChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select Type</option>
                <option value="CITY">City</option>
                <option value="DEPARTMENT">Department</option>
              </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TenantForm
