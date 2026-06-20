import React, { useState } from "react";
import { Button } from "../../../ui/Button";
import { Badge } from "../../../ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../../../services/adminService";

const AssignSHOModal = ({
  open,
  onClose,
  onAssign,
  stationId,
  isAssigning,
}) => {
  const [selectedPoliceId, setSelectedPoliceId] = useState(null);

  const { data: policeData, isLoading: isLoadingPolice } = useQuery({
    queryKey: ["stationPolice", stationId],
    queryFn: () => adminService.getAllPolice(1, "APPROVED", stationId),
    enabled: !!open && !!stationId,
  });

  const stationPolice = policeData?.police || [];

  const handleSubmit = () => {
    if (!selectedPoliceId || !stationId) {
      console.error('Invalid data for SHO assignment:', { selectedPoliceId, stationId })
      return
    }
    onAssign({ stationId, policeId: selectedPoliceId });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center pt-10">
        <div className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Assign Station Head Officer
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={isAssigning}
            >
              ✕
            </button>
          </div>

          {isLoadingPolice ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : stationPolice.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No police officers assigned to this station yet.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Select a police officer to assign as Station Head Officer:
              </p>
              {stationPolice.map((officer) => (
                <div
                  key={officer._id}
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedPoliceId === officer._id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedPoliceId(officer._id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-medium font-semibold">{officer.fullName}</p>
                      {officer.isStationHead && (
                        <Badge variant="success" className="text-xs">
                          Current SHO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Email: </span>{officer.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Badge Number: </span>{officer.badgeNumber || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedPoliceId === officer._id}
                      onChange={() => setSelectedPoliceId(officer._id)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPoliceId || isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign SHO"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignSHOModal;
