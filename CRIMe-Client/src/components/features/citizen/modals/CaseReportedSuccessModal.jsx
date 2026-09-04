import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/Dialog'
import { Button } from '../../../ui/Button'
import { CheckCircle2, Download, Loader2 } from 'lucide-react'

export const CaseReportedSuccessModal = ({ open, onClose, onDownloadReceipt, caseId, isDownloading }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Case Reported Successfully
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Your case has been submitted successfully. You can download the acknowledgment receipt below.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Case ID: {caseId}</p>
            <p className="text-xs text-muted-foreground">
              Save this ID for future reference. You can track your case status and download the receipt anytime from your case details page.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            onClick={onDownloadReceipt}
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
            View My Cases
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
