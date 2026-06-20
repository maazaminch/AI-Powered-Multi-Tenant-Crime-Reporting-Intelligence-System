import React from "react";
import PoliceStationForm from "../forms/PoliceStationForm";

const CreateStationModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center pt-10">
        <div className="w-full max-w-2xl rounded-lg border bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create New Station</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
          <PoliceStationForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateStationModal;
