/**
 * Server-side data fetching functions.
 * Used by Server Components (e.g. home page, providers list page).
 * Client components use `/api/*` route handlers instead.
 */

const API = process.env.BACKEND_URL || "http://localhost:5000";

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

async function fetchJSON<T>(path: string, options?: FetchOptions): Promise<T> {
  const fetchOptions: FetchOptions = options?.next
    ? options
    : { cache: "no-cache", ...options };
  const res = await fetch(`${API}${path}`, fetchOptions as RequestInit);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

export function getProviders() {
  return fetchJSON<{ success: boolean; count: number; data: import("@/types").Provider[] }>("/api/providers", {
    next: { revalidate: 60 },
  });
}

export function getProvider(id: string) {
  return fetchJSON<{ success: boolean; data: import("@/types").Provider }>(`/api/providers/${id}`);
}
