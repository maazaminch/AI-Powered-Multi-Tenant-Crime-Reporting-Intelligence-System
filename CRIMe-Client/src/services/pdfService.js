import api from './api.js'

// With responseType 'blob', error bodies also arrive as a Blob.
// Convert them back to JSON so error.response.data.message works.
const parseBlobError = async (error) => {
  const data = error?.response?.data
  if (data instanceof Blob) {
    try {
      error.response.data = JSON.parse(await data.text())
    } catch {
      // leave as is
    }
  }
  return error
}

const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const pdfService = {
  // Guest receipt (tracking token required)
  guestDownloadReceipt: async (caseId, trackingToken) => {
    try {
      const response = await api.get(`/api/pdf/guest-receipt/${caseId}`, {
        params: { trackingToken },
        responseType: 'blob'
      })
      saveBlob(response, `receipt-${caseId}.pdf`)
      return { success: true }
    } catch (error) {
      await parseBlobError(error)
      console.error('Error downloading receipt:', error)
      throw error
    }
  },

  // Citizen / staff receipt
  downloadReceipt: async (caseId) => {
    try {
      const response = await api.get(`/api/pdf/receipt/${caseId}`, {
        responseType: 'blob'
      })
      saveBlob(response, `receipt-${caseId}.pdf`)
      return { success: true }
    } catch (error) {
      await parseBlobError(error)
      console.error('Error downloading receipt:', error)
      throw error
    }
  },

  // Final report (station head only)
  downloadFinalReport: async (caseId) => {
    try {
      const response = await api.get(`/api/pdf/final-report/${caseId}`, {
        responseType: 'blob'
      })
      saveBlob(response, `final-report-${caseId}.pdf`)
      return { success: true }
    } catch (error) {
      await parseBlobError(error)
      console.error('Error downloading final report:', error)
      throw error
    }
  }
}