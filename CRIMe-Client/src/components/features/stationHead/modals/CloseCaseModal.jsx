import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { Textarea } from '../../../ui/Textarea'
import { Label } from '../../../ui/Label'
import { Loader2, AlertTriangle } from 'lucide-react'

export const CloseCaseModal = ({ open, onClose, onCloseCase, isClosing }) => {
  const [remarks, setRemarks] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onCloseCase(remarks)
    setRemarks('')
  }

  const handleClose = () => {
    setRemarks('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Close Case
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">
                This action will close the case. This cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Closing Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter closing remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isClosing}>
              {isClosing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Close Case
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
