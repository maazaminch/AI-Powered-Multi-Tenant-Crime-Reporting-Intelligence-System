import React from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

const InvitePoliceForm = ({ 
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting }) => {

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">Invite Police</h3>
        <p className="mt-2 text-sm text-muted-foreground">Send an invite link to a new police officer.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Police Email</label>
            <Input
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="police@example.com"
              required
            />
          </div>

          <input type="hidden" name="role" value="POLICE" />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Invite'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InvitePoliceForm
