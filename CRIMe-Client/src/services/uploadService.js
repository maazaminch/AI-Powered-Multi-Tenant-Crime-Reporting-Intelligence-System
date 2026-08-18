import api from './api.js'

export const uploadService = {
  // Get public upload URL for profile picture during registration
  getPublicProfileUploadUrl: async (filename, type) => {
    const response = await api.post('/api/uploads/profile-url-public', {
      filename,
      type
    })
    return response
  },

  // Get public upload URL for evidence (for guests and citizens)
  getPublicEvidenceUploadUrl: async (filename, type) => {
    const response = await api.post('/api/uploads/evidence-url-public', {
      filename,
      type
    })
    return response
  },

  // Upload file to storage (handles both S3 and Cloudinary)
  uploadFile: async (uploadParams, file) => {
    const { uploadUrl, provider, uploadPreset, publicId, folder } = uploadParams

    if (provider === 'cloudinary') {
      // Simple Cloudinary upload with preset
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      
      if (publicId) formData.append('public_id', publicId)
      if (folder) formData.append('folder', folder)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Cloudinary error:', errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }

      return await response.json()
    } else {
      // S3 upload using PUT with presigned URL
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      })

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.statusText}`)
      }

      return response
    }
  },

  // Legacy method for backward compatibility
  uploadFileToS3: async (uploadUrl, file) => {
    return this.uploadFile({ uploadUrl, provider: 's3' }, file)
  }
}

