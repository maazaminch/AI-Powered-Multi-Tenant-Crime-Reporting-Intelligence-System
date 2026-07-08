import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/Select'
import { Label } from '../../../ui/Label'
import { Loader2 } from 'lucide-react'

export const AssignCaseModal = ({ open, onClose, onAssign, isAssigning, policeOfficers }) => {
  const [selectedPolice, setSelectedPolice] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedPolice) {
      onAssign(selectedPolice)
      setSelectedPolice('')
    }
  }

  const handleClose = () => {
    setSelectedPolice('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Case to Police Officer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="police">Select Police Officer *</Label>
              <Select value={selectedPolice} onValueChange={setSelectedPolice} required>
                <SelectTrigger id="police">
                  <SelectValue placeholder="Select a police officer" />
                </SelectTrigger>
                <SelectContent>
                  {policeOfficers?.map((police) => (
                    <SelectItem key={police._id} value={police._id}>
                      {police.fullName} - {police.badgeNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAssigning || !selectedPolice}>
              {isAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Assign Case
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
