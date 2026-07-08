import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { Textarea } from '../../../ui/Textarea'
import { Input } from '../../../ui/Input'
import { Label } from '../../../ui/Label'
import { Loader2 } from 'lucide-react'

export const AddStatementModal = ({ open, onClose, onAddStatement, isAdding }) => {
  const [statement, setStatement] = useState('')
  const [witnessName, setWitnessName] = useState('')
  const [witnessContact, setWitnessContact] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (statement.trim()) {
      onAddStatement({
        updateType: 'STATEMENT',
        statement,
        witnessName,
        witnessContact,
        remarks: 'Statement added by Station Head'
      })
      setStatement('')
      setWitnessName('')
      setWitnessContact('')
    }
  }

  const handleClose = () => {
    setStatement('')
    setWitnessName('')
    setWitnessContact('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Statement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="witnessName">Witness Name (Optional)</Label>
              <Input
                id="witnessName"
                placeholder="Enter witness name"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="witnessContact">Witness Contact (Optional)</Label>
              <Input
                id="witnessContact"
                placeholder="Enter witness contact"
                value={witnessContact}
                onChange={(e) => setWitnessContact(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statement">Statement</Label>
              <Textarea
                id="statement"
                placeholder="Enter the statement..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !statement.trim()}>
              {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Statement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
