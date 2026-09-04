import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { CheckCircle2, Download, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export const GuestCaseReportedSuccessModal = ({ open, onClose, onDownloadReceipt, caseId, trackingToken, isDownloading }) => {
  const handleCopyTrackingToken = () => {
    navigator.clipboard.writeText(trackingToken)
    toast.success('Tracking token copied to clipboard')
  }

  const handleDownloadReceipt = () => {
    onDownloadReceipt({ caseId, trackingToken })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Case Reported Successfully
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Your case has been submitted successfully. Save your tracking token to check the status later.
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Case ID: {caseId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Tracking Token:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-slate-100 rounded text-sm font-mono break-all">
                  {trackingToken}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTrackingToken}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You can download the receipt now. This is the only time you can download it without creating an account.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
            className="w-full sm:w-auto"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
