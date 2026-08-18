import React from "react";
import { Button } from "../../../ui/Button";
import { Badge } from "../../../ui/Badge";
import { useTenantDetails } from "../../../../hooks/superadmin/useTenantDetails";

import Loader from "../../../ui/feedback/Loader";
import ErrorState from "../../../ui/feedback/ErrorState";

const TenantDetailsModal = ({
  tenantId,
  open,
  onClose,
}) => {

      const {
        tenantDetails,
        isDetailsLoading,
        error
      } = useTenantDetails(tenantId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white bg-card p-6 shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Tenant Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Detailed tenant information.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {isDetailsLoading ? (
          <Loader text="Loading tenant details..." />
        ) : error ? (
          <ErrorState
            title='Error Loading Admin Details'
            description='Failed to load admin details.'
          />
        ) : tenantDetails ? (
          <div className="mt-5 space-y-4">

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Name
              </p>
              <p className="text-sm font-medium">
                {tenantDetails.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Region
              </p>
              <p className="text-sm font-medium">
                {tenantDetails.region}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Type
              </p>
              <p className="text-sm font-medium">
                {tenantDetails.type}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Status
              </p>

              <div className="mt-1">
                <Badge
                  variant={
                    tenantDetails.isActive
                      ? "success"
                      : "destructive"
                  }
                >
                  {tenantDetails.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {tenantDetails.code && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Tenant Code
                </p>
                <p className="text-sm font-medium">
                  {tenantDetails.code}
                </p>
              </div>
            )}

            {tenantDetails.createdAt && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Created
                </p>
                <p className="text-sm font-medium">
                  {new Date(
                    tenantDetails.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Failed to load tenant details.
          </p>
        )}

        {/* Footer */}
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

export default TenantDetailsModal;

