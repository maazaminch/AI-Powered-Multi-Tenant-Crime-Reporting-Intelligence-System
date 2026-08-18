import React from "react";
import { Button } from "../../../ui/Button";
import { Badge } from "../../../ui/Badge";

import { usePoliceStationDetails } from "../../../../hooks/admin/usePoliceStationDetails";

import Loader from "../../../ui/feedback/Loader";
import ErrorState from "../../../ui/feedback/ErrorState";
import NoData from "../../../ui/feedback/NoData";

const StationDetailsModal = ({
  open,
  onClose,
  stationId,
}) => {
  const { 
    stationDetails,
    isDetailsLoading,
    error } = usePoliceStationDetails(stationId);
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Station Details</h3>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {isDetailsLoading ? (
          <Loader 
            text='Loading station details...'
          />
        ) : error ? (
          <ErrorState 
            title="Error loading station details"
          />
        ) : stationDetails.length === 0 ? (
          <NoData 
            title="No Details Found"
          />
        ) : (
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Name
                  </p>
                  <p className="text-sm font-medium">
                    {stationDetails.name}
                  </p>
                </div>

                {stationDetails.locationLabel && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Location
                    </p>
                    <p className="text-sm font-medium">
                      {stationDetails.locationLabel}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Exact Address
                  </p>
                  <p className="text-sm font-medium">
                    {stationDetails.address}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    City
                  </p>
                  <p className="text-sm font-medium">
                    {stationDetails.city || "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Status
                  </p>

                  <Badge
                    variant={
                      stationDetails.isActive
                        ? "success"
                        : "destructive"
                    }
                  >
                    {stationDetails.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>

                {stationDetails.code && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Station Code
                    </p>
                    <p className="text-sm font-medium">
                      {stationDetails.code}
                    </p>
                  </div>
                )}

                {stationDetails.createdAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Created
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(
                        stationDetails.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Station Head
                </h3>

                {stationDetails.stationHead ? (
                  <div className="space-y-3 rounded-lg border bg-muted p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Name
                      </p>
                      <p className="text-sm font-medium">
                        {stationDetails.stationHead.fullName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Email
                      </p>
                      <p className="text-sm font-medium">
                        {stationDetails.stationHead.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm font-medium">
                        {stationDetails.stationHead.phone || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Badge Number
                      </p>
                      <p className="text-sm font-medium">
                        {stationDetails.stationHead.badgeNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                    No station head assigned.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StationDetailsModal;
