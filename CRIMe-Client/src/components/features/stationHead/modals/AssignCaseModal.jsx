import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
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
      <DialogContent className="sm:max-w-[400px] bg-white">
        <DialogHeader>
          <DialogTitle>Assign Case to Police Officer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="police">Select Police Officer *</Label>
              <select
                id="police"
                value={selectedPolice}
                onChange={(e) => setSelectedPolice(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {policeOfficers?.map((police) => (
                  <option key={police._id} value={police._id}>
                    {police.fullName} - {police.badgeNumber}
                  </option>
                ))}
              </select>
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
