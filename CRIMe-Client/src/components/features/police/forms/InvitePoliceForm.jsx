import React from 'react'
import { Button } from '../../../ui/Button'
import { Input } from '../../../ui/Input'

const InvitePoliceForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting }) => {

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
  )
}

export default InvitePoliceForm
