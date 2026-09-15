import { useState } from 'react'
import { Upload, X, FileIcon } from 'lucide-react'
import { Button } from '../../../ui/Button'

const UploadEvidenceModal = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  isUploading = false,
  maxFiles = 5,
  acceptedTypes = "image/*,.pdf,.doc,.docx",
  maxSizeMB = 25
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file count
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed per upload`)
      return
    }

    // Validate file sizes
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the ${maxSizeMB}MB limit`)
      return
    }

    // Call the upload function
    await onUpload(files)
    
    // Reset the file input
    e.target.value = ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload Evidence</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept={acceptedTypes}
            className="hidden"
            id="evidence-upload-modal"
            disabled={isUploading}
          />
          <label
            htmlFor="evidence-upload-modal"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Click to upload evidence files'}
            </span>
            <span className="text-xs text-muted-foreground">
              Images, PDF, DOC, DOCX (Max {maxSizeMB}MB each, {maxFiles} files)
            </span>
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Uploaded Files:</p>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <FileIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadEvidenceModal