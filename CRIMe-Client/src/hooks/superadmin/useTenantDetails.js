// hooks/superadmin/useAdminDetails.js

import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "../../services/superAdminService";

export const useTenantDetails = (tenantId) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant-details", tenantId],
    queryFn: () => superAdminService.getTenantDetails(tenantId),
    enabled: !!tenantId,
  });

  return {
    tenantDetails: data,
    isDetailsLoading: isLoading,
    error,
  };
};