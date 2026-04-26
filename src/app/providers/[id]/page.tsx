import ProviderDetailClient from "./ProviderDetailClient";
import type { Provider, Car, Booking, Review } from "@/types";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  let provider: Provider | null = null;
  let cars: Car[] = [];
  let bookings: Booking[] = [];
  let reviews: Review[] = [];

  try {
    const res = await fetch(`${BACKEND}/api/providers/${params.id}/detail`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        provider = data.data.provider;
        cars = data.data.cars ?? [];
        bookings = data.data.bookings ?? [];
        reviews = data.data.reviews ?? [];
      }
    }
  } catch {}

  return (
    <ProviderDetailClient
      provider={provider}
      initialCars={cars}
      initialBookings={bookings}
      initialReviews={reviews}
    />
  );
}
