
import React from 'react'
import { Button } from '../../ui/Button'

const AssignOrTransferAdminForm = ({
  adminName,
  tenants = [],
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isTransfer, 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold">
          {isTransfer ? 'Transfer' : 'Assign'}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {isTransfer
            ? `Transfer ${adminName} to a different tenant.`
            : `Assign ${adminName} to a tenant.`}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {/* Tenant Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Select Tenant
            </label>

            <select
              name="tenantId"
              value={formData.tenantId}
              onChange={onChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Select Tenant</option>

              {tenants.map((tenant) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-2">
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
              {isTransfer ? 'Transferring...' : 'Assign Tenant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignOrTransferAdminForm