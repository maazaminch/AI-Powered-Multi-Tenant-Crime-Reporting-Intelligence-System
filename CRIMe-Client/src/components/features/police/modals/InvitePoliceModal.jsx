import React from "react";
import InvitePoliceForm from "../forms/InvitePoliceForm";

const InvitePoliceModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  formData,
  onChange,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center pt-10">
        <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Invite Police</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Send an invite link to a new police officer.
          </p>
          <InvitePoliceForm
            formData={formData}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default InvitePoliceModal;
