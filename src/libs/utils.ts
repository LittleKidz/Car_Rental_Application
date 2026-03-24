/**
 * Calculate the number of days between two date strings.
 */
export function calcDays(pickup: string, returnDate: string): number {
  if (!pickup || !returnDate) return 0;
  const diff =
    new Date(returnDate).getTime() - new Date(pickup).getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/**
 * Format an ISO date string to dd/mm/yyyy (en-GB).
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB");
}

/**
 * Convert ISO date string to yyyy-mm-dd for <input type="date">.
 */
export function toInputDate(iso: string): string {
  return new Date(iso).toISOString().split("T")[0];
}

/**
 * Today's date as yyyy-mm-dd.
 */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Fetch JSON with built-in error handling — never throws.
 * Returns parsed JSON on success, or `null` on any failure.
 */
export async function safeFetch<T = Record<string, unknown>>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Check whether two date ranges overlap.
 * Returns true if [startA, endA) overlaps with [startB, endB).
 */
export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

/**
 * Map car color name to Tailwind bg class.
 */
export const COLOR_MAP: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  black: "bg-gray-800",
  white: "bg-white border border-slate-300",
  silver: "bg-slate-300",
  gray: "bg-gray-400",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  orange: "bg-orange-500",
  brown: "bg-amber-700",
  pink: "bg-pink-400",
  purple: "bg-purple-500",
};
