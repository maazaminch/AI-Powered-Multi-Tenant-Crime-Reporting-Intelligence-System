import React from "react";
import { Button } from "../../../ui/Button";

const AssignOrTransferStationForm = ({
  stations = [],
  formData = {},
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isTransfer,
}) => {

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      <div>
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          Select Station
        </label>

        <select
          name="stationId"
          value={formData.stationId || ""}
          onChange={onChange}
          className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
          required
          disabled={isSubmitting}
        >

          <option value="">
            Select Station
          </option>

          
          {stations.map((station) => (
            <option
              key={station._id}
              value={station._id}
            >
              {station.stationName || station.name}
            </option>
          ))}

        </select>
      </div>


      <div className="flex justify-end gap-2 pt-2">

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>


        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? (isTransfer ? "Transferring..." : "Assigning...")
            : (isTransfer ? "Transfer Station" : "Assign Station")
          }
        </Button>

      </div>

    </form>
  );
};

export default AssignOrTransferStationForm;