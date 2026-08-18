// hooks/superadmin/useAdminDetails.js

import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "../../services/superAdminService";

export const useAdminsDetails = (adminId) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-details", adminId],
    queryFn: () => superAdminService.getAdminDetails(adminId),
    enabled: !!adminId,
  });

  return {
    adminDetails: data,
    isDetailsLoading: isLoading,
    error,
  };
};