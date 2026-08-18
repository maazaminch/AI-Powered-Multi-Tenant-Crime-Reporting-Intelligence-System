import { Button } from "../../../ui/Button";
import { Badge } from "../../../ui/Badge";
import { useAdminsDetails } from "../../../../hooks/superadmin/useAdminDetails";


import ErrorState from "../../../ui/feedback/ErrorState";
import Loader from "../../../ui/feedback/Loader";

const AdminDetailsModal = ({
  adminId,
  open,
  onClose,
}) => {

  const {
    adminDetails,
    isDetailsLoading,
    error
  } = useAdminsDetails(adminId);


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Admin Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Detailed admin information.
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
          <Loader 
            text="Loading admin details..."
          />
        ) : error ? (
          <ErrorState 
            title='Error Loading Admin Details'
            description='Failed to load admin details.'
          />
        ) : adminDetails ? (
          <div className="mt-5 space-y-4">

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Name
              </p>
              <p className="text-sm font-medium">
                {adminDetails.fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Email
              </p>
              <p className="text-sm font-medium">
                {adminDetails.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Status
              </p>

              <Badge
                variant={
                  adminDetails.status === "APPROVED"
                    ? "success"
                    : "destructive"
                }
              >
                {adminDetails.status}
              </Badge>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Tenant
              </p>

              <p className="text-sm font-medium">
                {adminDetails.tenantId?.name ?? "Unassigned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Contact Number
              </p>

              <p className="text-sm font-medium">
                {adminDetails.phone ?? "N/A"}
              </p>
            </div>

            {adminDetails.createdAt && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Created
                </p>

                <p className="text-sm font-medium">
                  {new Date(adminDetails.createdAt).toLocaleString()}
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Unable to load admin details.
          </div>
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


export default AdminDetailsModal;