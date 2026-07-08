import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { Input } from '../../../ui/Input'
import { Textarea } from '../../../ui/Textarea'
import { Label } from '../../../ui/Label'
import { Loader2 } from 'lucide-react'

export const AddArrestModal = ({ open, onClose, onAddArrest, isAdding }) => {
  const [arrest, setArrest] = useState({
    arrestedPersonName: '',
    arrestedPersonContact: '',
    arrestReason: '',
    arrestDate: new Date().toISOString().split('T')[0],
    arrestLocation: '',
    remarks: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (arrest.arrestedPersonName && arrest.arrestReason) {
      onAddArrest({
        updateType: 'ARREST',
        arrest,
        remarks: arrest.remarks || 'Arrest record added by Station Head'
      })
      setArrest({
        arrestedPersonName: '',
        arrestedPersonContact: '',
        arrestReason: '',
        arrestDate: new Date().toISOString().split('T')[0],
        arrestLocation: '',
        remarks: ''
      })
    }
  }

  const handleClose = () => {
    setArrest({
      arrestedPersonName: '',
      arrestedPersonContact: '',
      arrestReason: '',
      arrestDate: new Date().toISOString().split('T')[0],
      arrestLocation: '',
      remarks: ''
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Arrest</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="arrestedPersonName">Arrested Person Name *</Label>
              <Input
                id="arrestedPersonName"
                placeholder="Enter name"
                value={arrest.arrestedPersonName}
                onChange={(e) => setArrest({ ...arrest, arrestedPersonName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrestedPersonContact">Contact Number</Label>
              <Input
                id="arrestedPersonContact"
                placeholder="Enter contact number"
                value={arrest.arrestedPersonContact}
                onChange={(e) => setArrest({ ...arrest, arrestedPersonContact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrestReason">Arrest Reason *</Label>
              <Textarea
                id="arrestReason"
                placeholder="Enter arrest reason"
                value={arrest.arrestReason}
                onChange={(e) => setArrest({ ...arrest, arrestReason: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrestDate">Arrest Date</Label>
              <Input
                id="arrestDate"
                type="date"
                value={arrest.arrestDate}
                onChange={(e) => setArrest({ ...arrest, arrestDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrestLocation">Arrest Location</Label>
              <Input
                id="arrestLocation"
                placeholder="Enter arrest location"
                value={arrest.arrestLocation}
                onChange={(e) => setArrest({ ...arrest, arrestLocation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter any additional remarks"
                value={arrest.remarks}
                onChange={(e) => setArrest({ ...arrest, remarks: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !arrest.arrestedPersonName || !arrest.arrestReason}>
              {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Record Arrest
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
