import React from "react";
import { Button } from "../../../ui/Button";
import { Badge } from "../../../ui/Badge";

const PoliceDetailsModal = ({
  open,
  onClose,
  policeDetails,
  isLoading,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Police Details</h3>
            <p className="text-sm text-muted-foreground">
              Detailed police information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : policeDetails ? (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Name
              </p>
              <p className="text-sm font-medium">{policeDetails.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Email
              </p>
              <p className="text-sm font-medium">{policeDetails.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Status
              </p>
              <Badge
                variant={policeDetails.status === "APPROVED" ? "success" : "destructive"}
              >
                {policeDetails.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Contact Number
              </p>
              <p className="text-sm font-medium">
                {policeDetails.phone ?? "Unassigned"}
              </p>
            </div>
            {policeDetails.createdAt && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Created
                </p>
                <p className="text-sm font-medium">
                  {new Date(policeDetails.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Unable to load police details.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PoliceDetailsModal;
