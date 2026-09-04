import { Button } from '../../ui/Button'
import { Download, FileText, Loader2 } from 'lucide-react'

export const DownloadReceiptButton = ({ caseId, onDownload, isDownloading, disabled = false, variant = "default", size = "default", className = "" }) => {
  return (
    <Button
      onClick={() => onDownload(caseId)}
      disabled={isDownloading || disabled}
      variant={variant}
      size={size}
      className={className}
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
  )
}

export const DownloadFinalReportButton = ({ caseId, version = "citizen", onDownload, isDownloading, disabled = false, variant = "default", size = "default", className = "" }) => {
  return (
    <Button
      onClick={() => onDownload({ caseId, version })}
      disabled={isDownloading || disabled}
      variant={variant}
      size={size}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Download Final Report
        </>
      )}
    </Button>
  )
}
