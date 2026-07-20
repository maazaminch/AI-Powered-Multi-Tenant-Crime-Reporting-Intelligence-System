import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { Textarea } from '../../../ui/Textarea'
import { Label } from '../../../ui/Label'
import { Loader2 } from 'lucide-react'

export const UpdateStatusModal = ({ open, onClose, onUpdateStatus, isUpdating, currentStatus }) => {
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')

  const allowedStatusTransitions = {
    'ASSIGNED': ['UNDER_INVESTIGATION'],
    'UNDER_INVESTIGATION': ['RESOLVED']
  }

  const getNextStatuses = () => {
    return allowedStatusTransitions[currentStatus] || []
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newStatus) {
      onUpdateStatus({ newStatus, remarks })
      setNewStatus('')
      setRemarks('')
    }
  }

  const handleClose = () => {
    setNewStatus('')
    setRemarks('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Case Status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select status</option>
                {getNextStatuses().map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !newStatus}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
