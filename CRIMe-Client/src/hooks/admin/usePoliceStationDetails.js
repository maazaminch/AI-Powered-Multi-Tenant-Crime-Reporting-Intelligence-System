import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";

export const usePoliceStationDetails = (stationId) => {
    const { data, isLoading, error } = useQuery({
    queryKey: ["police-station", stationId],
    queryFn: () => adminService.getStationDetails(stationId),
    enabled: !!stationId,
  });

  return {
    stationDetails: data,
    isDetailsLoading: isLoading,
    error,
  }
};