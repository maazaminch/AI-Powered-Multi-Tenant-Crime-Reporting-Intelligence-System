import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pdfService } from '../services/pdfService';

export const usePDF = () => {
  const queryClient = useQueryClient();

  const guestDownloadReceipt = useMutation({
    mutationFn: ({ caseId, trackingToken }) => pdfService.guestDownloadReceipt(caseId, trackingToken),
    onSuccess: () => {
      toast.success('Receipt downloaded successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to download receipt';
      toast.error(message);
    }
  });

  const downloadReceipt = useMutation({
    mutationFn: (caseId) => pdfService.downloadReceipt(caseId),
    onSuccess: () => {
      toast.success('Receipt downloaded successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to download receipt';
      toast.error(message);
    }
  });

  const downloadFinalReport = useMutation({
    mutationFn: ({ caseId, version }) => pdfService.downloadFinalReport(caseId, version),
    onSuccess: () => {
      toast.success('Final report downloaded successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to download final report';
      toast.error(message);
    }
  });

  return {
    guestDownloadReceipt: guestDownloadReceipt.mutate,
    isGuestDownloadingReceipt: guestDownloadReceipt.isPending,
    downloadReceipt: downloadReceipt.mutate,
    isDownloadingReceipt: downloadReceipt.isPending,
    downloadFinalReport: downloadFinalReport.mutate,
    isDownloadingFinalReport: downloadFinalReport.isPending
  };
};
