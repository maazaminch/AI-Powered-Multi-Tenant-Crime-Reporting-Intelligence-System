import React from "react";
import AssignOrTransferStationForm from "../forms/AssignOrTransferStationForm";

const AssignOrTransferStationModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  formData,
  onChange,
  policeName,
  stations = [],
  isTransfer,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isTransfer ? "Transfer Station" : "Assign Station"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {isTransfer
            ? `Transfer ${policeName} to another station.`
            : `Assign ${policeName} to a station.`}
        </p>

        <AssignOrTransferStationForm
          stations={stations}
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          isTransfer={isTransfer}
        />

      </div>
    </div>
  );
};

export default AssignOrTransferStationModal;