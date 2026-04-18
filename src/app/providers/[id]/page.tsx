"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/features/cartSlice";
import { RootState, AppDispatch } from "@/redux/store";
import type { Provider, Car, Booking } from "@/types";
import { safeFetch, calcDays, datesOverlap, COLOR_MAP, today } from "@/libs/utils";
import { useToast, Toast } from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const router = useRouter();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [toast, showToast] = useToast();

  useEffect(() => {
    async function load() {
      const [pRes, cRes, bRes] = await Promise.all([
        safeFetch<{ success: boolean; data: Provider }>(`/api/providers/${id}`),
        safeFetch<{ success: boolean; data: Car[] }>(`/api/providers/${id}/cars`),
        safeFetch<{ success: boolean; data: Booking[] }>(`/api/providers/${id}/cars/bookings`),
      ]);
      if (pRes?.success) setProvider(pRes.data);
      if (cRes?.success) setCars(cRes.data);
      if (bRes?.success) setBookings(bRes.data || []);
      setLoading(false);
    }
    load();
  }, [id]);

  const datesSelected = !!(pickupDate && returnDate && new Date(returnDate) > new Date(pickupDate));
  const days = calcDays(pickupDate, returnDate);

  const isCarBooked = (carId: string) =>
    datesSelected && bookings.some((b) => b.car === carId && datesOverlap(b.rentalDate, b.returnDate, pickupDate, returnDate));

  const isCarInCart = (carId: string) =>
    datesSelected && cartItems.some((item) => item.car._id === carId && datesOverlap(item.rentalDate, item.returnDate, pickupDate, returnDate));

  const handleAddToCart = (car: Car) => {
    if (!session) { router.push("/login"); return; }
    if (!datesSelected) { showToast("Please select both pickup and return dates"); return; }
    if (cartItems.length >= 3 && session.user.role !== "admin") { showToast("Maximum 3 rentals allowed"); return; }
    if (isCarBooked(car._id)) { showToast("This car is already booked for those dates"); return; }
    if (isCarInCart(car._id)) { showToast("This car is already in your cart for overlapping dates"); return; }
    if (!provider) return;

    dispatch(addToCart({ provider, car, rentalDate: pickupDate, returnDate }));
    showToast(`${car.brand} ${car.model} added to cart!`);
  };

  if (loading) return <Loading />;
  if (!provider) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-slate-400">Provider not found.</div>;

  const todayStr = today();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Toast message={toast} />

      {/* Provider Info */}
      <div className="card p-6 sm:p-8 mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
            <p className="text-slate-500 mt-1">{provider.address}</p>
            {provider.telephone && <p className="text-sm text-slate-400 mt-1">Tel: {provider.telephone}</p>}
          </div>
        </div>
      </div>

      {/* Date Pickers */}
      <div className="card p-5 mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="label">Pickup Date</label>
            <input type="date" className="input-field" value={pickupDate}
              onChange={(e) => { setPickupDate(e.target.value); if (returnDate && e.target.value >= returnDate) setReturnDate(""); }}
              min={todayStr} />
          </div>
          <div className="flex-1">
            <label className="label">Return Date</label>
            <input type="date" className="input-field" value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate || todayStr} disabled={!pickupDate} />
          </div>
          {days > 0 && (
            <div className="shrink-0 pb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold">{days} day{days > 1 ? "s" : ""}</span>
            </div>
          )}
          {cartItems.length > 0 && (
            <button onClick={() => router.push("/rentals/manage")} className="btn-secondary text-sm shrink-0">View Cart ({cartItems.length})</button>
          )}
        </div>
        {pickupDate && !returnDate && <p className="text-xs text-amber-600 mt-2">Please select a return date to see availability</p>}
      </div>

      {/* Cars */}
      <h2 className="text-xl font-bold text-slate-900 mb-5">Cars ({cars.length})</h2>

      {cars.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No cars available for this provider yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {cars.map((car) => {
            const colorClass = COLOR_MAP[car.color.toLowerCase()] || "bg-slate-400";
            const booked = isCarBooked(car._id);
            const inCart = isCarInCart(car._id);
            const unavailable = !car.available || booked || inCart;

            let statusLabel = "Available", statusColor = "bg-emerald-50 text-emerald-700";
            if (!car.available) { statusLabel = "Unavailable"; statusColor = "bg-red-50 text-red-600"; }
            else if (booked) { statusLabel = "Booked for these dates"; statusColor = "bg-red-50 text-red-600"; }
            else if (inCart) { statusLabel = "Already in cart"; statusColor = "bg-amber-50 text-amber-700"; }

            return (
              <div key={car._id} className={`card overflow-hidden ${unavailable ? "opacity-60" : ""}`}>
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img src={car.image || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"} alt={`${car.brand} ${car.model}`} loading="lazy" className="w-full h-full object-cover" />
                  {unavailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold bg-red-600 px-3 py-1 rounded-full">{!car.available ? "Unavailable" : booked ? "Booked" : "In Cart"}</span>
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${colorClass} ring-2 ring-white`} title={car.color} />
                </div>
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-semibold text-slate-900">{car.brand} {car.model}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{car.licensePlate}</p>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-indigo-600">฿{car.dailyRate.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">/ day</span>
                    {days > 0 && !unavailable && <span className="text-sm font-semibold text-slate-600 ml-auto">฿{(car.dailyRate * days).toLocaleString()} total</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                    {!unavailable && datesSelected && <button onClick={() => handleAddToCart(car)} className="btn-primary text-xs px-4 py-2">Add to Cart</button>}
                    {!unavailable && !datesSelected && <span className="text-xs text-slate-400">Select dates first</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
