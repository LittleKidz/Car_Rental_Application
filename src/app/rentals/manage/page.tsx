"use client";

import { useSession } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { removeFromCart, clearCart } from "@/redux/features/cartSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { calcDays, formatDate } from "@/libs/utils";
import { useToast, Toast } from "@/components/ui/Toast";

export default function ManageRentalsPage() {
  const { data: session } = useSession();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, showToast] = useToast(4000);
  const [results, setResults] = useState<{ ok: boolean; msg: string }[]>([]);

  const totalCost = cartItems.reduce(
    (sum, item) => sum + item.car.dailyRate * calcDays(item.rentalDate, item.returnDate),
    0,
  );

  const handleSubmitAll = async () => {
    if (!session?.user.token) return;
    setSubmitting(true);

    const res = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const r = await fetch("/api/rentals", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.user.token}` },
            body: JSON.stringify({
              rentalDate: item.rentalDate,
              returnDate: item.returnDate,
              provider: item.provider._id,
              car: item.car._id,
            }),
          }).then((r) => r.json());

          return r.success
            ? { ok: true, msg: `${item.car.brand} ${item.car.model} — Booked!` }
            : { ok: false, msg: `${item.car.brand} ${item.car.model} — ${r.message || "Failed"}` };
        } catch {
          return { ok: false, msg: `${item.car.brand} ${item.car.model} — Network error` };
        }
      }),
    );

    setResults(res);

    const successIndices = res.reduce<number[]>(
      (acc, r, i) => (r.ok ? [...acc, i] : acc),
      [],
    );

    if (successIndices.length === res.length) {
      dispatch(clearCart());
      showToast("Bookings confirmed! Proceed to payment.");
      setTimeout(() => router.push("/rentals"), 1500);
    } else {
      // Remove only successfully booked items from cart (keep failed ones)
      successIndices.reverse().forEach((i) => dispatch(removeFromCart(i)));
      showToast(
        successIndices.length > 0
          ? "Some bookings failed. Successfully booked items removed from cart."
          : "All bookings failed. Check details below.",
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Toast message={toast} />

      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Cart</h1>
        <p className="text-slate-500">Review your selections and confirm bookings</p>
      </div>

      {cartItems.length === 0 && results.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="mb-4">Your cart is empty.</p>
          <a href="/providers" className="btn-primary text-sm">Browse Providers</a>
        </div>
      ) : (
        <>
          {/* Booking results */}
          {results.length > 0 && (
            <div className="space-y-2 mb-8">
              {results.map((r, i) => (
                <div key={i} className={`px-4 py-3 rounded-xl text-sm ${r.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {r.ok ? "✓" : "✗"} {r.msg}
                </div>
              ))}
              {results.every((r) => r.ok) && (
                <div className="mt-4 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
                  All bookings confirmed! Go to <button onClick={() => router.push("/rentals")} className="underline font-medium">My Rentals</button> to complete payment.
                </div>
              )}
            </div>
          )}

          {/* Cart items */}
          <div className="space-y-4 stagger-children">
            {cartItems.map((item, idx) => {
              const days = calcDays(item.rentalDate, item.returnDate);
              return (
                <div key={idx} className="card overflow-hidden">
                  <div className="flex items-center">
                    <div className="w-36 h-28 shrink-0 bg-slate-100">
                      <img
                        src={item.car.image || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"}
                        alt={`${item.car.brand} ${item.car.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 px-4 py-3">
                      <h3 className="font-semibold text-slate-900">{item.car.brand} {item.car.model}</h3>
                      <p className="text-sm text-slate-500">{item.provider.name} · {item.car.licensePlate}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-sm text-indigo-600 font-medium">{formatDate(item.rentalDate)}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-sm text-indigo-600 font-medium">{formatDate(item.returnDate)}</span>
                        <span className="text-xs text-slate-400">({days} day{days > 1 ? "s" : ""})</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 mt-1">฿{(item.car.dailyRate * days).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(idx))}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {cartItems.length > 0 && (
            <div className="mt-8 card p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600 font-medium">
                  Total: {cartItems.length} rental{cartItems.length > 1 ? "s" : ""}
                </span>
                <span className="text-xl font-bold text-slate-900">฿{totalCost.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Payment will be processed separately for each booking via QR code.
              </p>
              <div className="flex gap-3">
                <button onClick={() => dispatch(clearCart())} className="btn-secondary flex-1">Clear Cart</button>
                <button onClick={handleSubmitAll} disabled={submitting} className="btn-primary flex-1">
                  {submitting ? "Booking…" : "Confirm All Bookings"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
