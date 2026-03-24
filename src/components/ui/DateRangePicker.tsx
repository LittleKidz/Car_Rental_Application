"use client";

import { today } from "@/libs/utils";

interface Props {
  pickup: string;
  returnDate: string;
  onPickupChange: (value: string) => void;
  onReturnChange: (value: string) => void;
  compact?: boolean;
}

export default function DateRangePicker({
  pickup,
  returnDate,
  onPickupChange,
  onReturnChange,
  compact = false,
}: Props) {
  const minDate = today();
  const labelClass = compact ? "text-xs text-slate-500" : "label";

  return (
    <>
      <div className={compact ? "" : "flex-1"}>
        <label className={labelClass}>Pickup</label>
        <input
          type="date"
          className="input-field"
          value={pickup}
          onChange={(e) => {
            onPickupChange(e.target.value);
            if (returnDate && e.target.value >= returnDate) onReturnChange("");
          }}
          min={minDate}
        />
      </div>
      <div className={compact ? "" : "flex-1"}>
        <label className={labelClass}>Return</label>
        <input
          type="date"
          className="input-field"
          value={returnDate}
          onChange={(e) => onReturnChange(e.target.value)}
          min={pickup || minDate}
          disabled={!pickup}
        />
      </div>
    </>
  );
}
