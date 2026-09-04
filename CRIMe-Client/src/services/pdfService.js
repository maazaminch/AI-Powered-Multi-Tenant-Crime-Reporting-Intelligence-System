import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const pdfService = {
  // Guest download receipt (no auth, one-time only)
  guestDownloadReceipt: async (caseId, trackingToken) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pdf/guest/receipt?caseId=${caseId}&trackingToken=${trackingToken}`,
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${caseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  },

  // Download acknowledgment receipt (immutable, generated at case creation)
  downloadReceipt: async (caseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pdf/receipt/${caseId}`, {
        responseType: 'blob',
        withCredentials: true
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${caseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  },

  // Download final report (immutable, generated at case closure)
  downloadFinalReport: async (caseId, version = 'citizen') => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pdf/final-report/${caseId}?version=${version}`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `final-report-${version}-${caseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading final report:', error);
      throw error;
    }
  }
};
