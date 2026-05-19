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

  // Upload file to S3 using presigned URL
  uploadFileToS3: async (uploadUrl, file) => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    })
    return response
  }
}

export default uploadService
