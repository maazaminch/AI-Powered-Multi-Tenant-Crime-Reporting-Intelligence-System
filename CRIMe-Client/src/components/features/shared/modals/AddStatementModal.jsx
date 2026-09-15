import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { Textarea } from '../../../ui/Textarea'
import { Input } from '../../../ui/Input'
import { Label } from '../../../ui/Label'
import { Loader2 } from 'lucide-react'

export const AddStatementModal = ({ open, onClose, onAddStatement, isAdding }) => {
  const [text, setText] = useState('')
  const [personName, setPersonName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onAddStatement({
        updateType: 'STATEMENT',
        statement: {
          text,
          personName
        }
      })
      setText('')
      setPersonName('')
    }
  }

  const handleClose = () => {
    setText('')
    setPersonName('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Add Statement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="personName">Person Name (Optional)</Label>
              <Input
                id="personName"
                placeholder="Enter person name"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Statement</Label>
              <Textarea
                id="text"
                placeholder="Enter the statement..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !text.trim()}>
              {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Statement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
