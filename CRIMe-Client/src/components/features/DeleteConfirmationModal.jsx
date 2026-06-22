import React from "react";
import { Button } from "../ui/Button";

const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
  entityName='item'
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background bg-white rounded-lg shadow-xl border p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">Delete {entityName}?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This action cannot be undone. It will be permanently deleted.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
