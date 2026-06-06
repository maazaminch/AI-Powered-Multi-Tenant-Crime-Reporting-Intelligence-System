import React from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../../components/ui/Input'

const InviteAdminForm = ({ tenantName, formData, onChange, onSubmit, onCancel, isSubmitting }) => {
  const title = tenantName ? `Invite Admin to ${tenantName}` : 'Invite Admin'
  const description = tenantName
    ? 'Send an invite link to a new admin for this tenant.'
    : 'Send an invite link to a new admin.'

  return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Admin Email
            </label>
            <Input
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={onChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InviteAdminForm
