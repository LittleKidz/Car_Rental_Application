import { calcDays, formatDate } from "@/libs/utils";

interface Props {
  pickup: string;
  returnDate: string;
  dailyRate?: number;
}

/** Displays: 01/04/2026 → 05/04/2026 (4 days) ฿7,200 */
export default function DateRangeDisplay({ pickup, returnDate, dailyRate }: Props) {
  const days = calcDays(pickup, returnDate);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-indigo-600 font-medium">
        {formatDate(pickup)}
      </span>
      <span className="text-slate-300">→</span>
      <span className="text-sm text-indigo-600 font-medium">
        {formatDate(returnDate)}
      </span>
      <span className="text-xs text-slate-400">
        ({days} day{days > 1 ? "s" : ""})
      </span>
      {dailyRate != null && (
        <span className="text-sm font-semibold text-slate-700">
          ฿{(dailyRate * days).toLocaleString()}
        </span>
      )}
    </div>
  );
}
