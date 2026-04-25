import ProviderDetailClient from "./ProviderDetailClient";
import type { Provider, Car, Review } from "@/types";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const [providerRes, carsRes, reviewsRes] = await Promise.all([
    fetchJSON<{ success: boolean; data: Provider }>(`/api/providers/${params.id}`),
    fetchJSON<{ success: boolean; data: Car[] }>(`/api/providers/${params.id}/cars`),
    fetchJSON<{ success: boolean; data: Review[] }>(`/api/providers/${params.id}/reviews`),
  ]);

  return (
    <ProviderDetailClient
      provider={providerRes?.success ? providerRes.data : null}
      initialCars={carsRes?.success ? carsRes.data : []}
      initialReviews={reviewsRes?.success ? reviewsRes.data : []}
    />
  );
}
