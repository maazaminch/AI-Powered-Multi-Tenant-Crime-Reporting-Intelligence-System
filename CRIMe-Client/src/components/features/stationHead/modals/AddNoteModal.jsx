import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { Textarea } from '../../../ui/Textarea'
import { Label } from '../../../ui/Label'
import { Loader2 } from 'lucide-react'

export const AddNoteModal = ({ open, onClose, onAddNote, isAdding }) => {
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (note.trim()) {
      onAddNote({ updateType: 'NOTE', note, remarks: 'Note added by Station Head' })
      setNote('')
    }
  }

  const handleClose = () => {
    setNote('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter your note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !note.trim()}>
              {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
