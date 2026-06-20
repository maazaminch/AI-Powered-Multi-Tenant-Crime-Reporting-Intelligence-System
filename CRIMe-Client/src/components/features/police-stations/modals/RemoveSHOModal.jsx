import React from "react";
import { Button } from "../../../ui/Button";

const RemoveSHOModal = ({
  open,
  onClose,
  onConfirm,
  shoName,
  isRemoving,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background bg-white rounded-lg shadow-xl border p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">Remove Station Head?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to remove <strong>{shoName}</strong> as the station head? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove SHO"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RemoveSHOModal;
