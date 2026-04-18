"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import type { Rental, Car, Provider, User } from "@/types";
import { formatDate, calcDays } from "@/libs/utils";

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user.token) return;

    fetch(`/api/rentals/${id}/receipt`, {
      headers: { Authorization: `Bearer ${session.user.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRental(data.data);
        else setError(data.message || "Receipt not available.");
      })
      .catch(() => setError("Failed to load receipt."))
      .finally(() => setLoading(false));
  }, [id, session]);

  if (status === "loading" || loading) return <Loading />;

  if (error)
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">{error}</p>
        <button
          onClick={() => router.push("/rentals")}
          className="btn-secondary text-sm"
        >
          Back to My Rentals
        </button>
      </div>
    );

  if (!rental) return null;

  const car = rental.car as Car | undefined;
  const provider = rental.provider as Provider;
  const user = rental.user as User;
  const days = calcDays(rental.rentalDate, rental.returnDate);

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Actions */}
        <div className="no-print flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Payment Receipt
            </h1>
            <p className="text-slate-500">Your booking has been confirmed</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Receipt card */}
        <div className="card overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v2h20V7L12 2zm-8 9v8h3v-8H4zm5 0v8h3v-8H9zm5 0v8h3v-8h-3zm5 0v8h3v-8h-3zM2 20h20v2H2v-2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">GoGo Rental</p>
                <p className="text-white/70 text-xs">Official Receipt</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Payment Status</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-400/20 text-emerald-200 text-xs font-semibold rounded-full uppercase tracking-wide">
                Paid
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Booking info */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Booking ID", value: rental._id },
                {
                  label: "Paid on",
                  value: rental.paidAt ? formatDate(rental.paidAt) : "–",
                },
                { label: "Customer", value: user?.name ?? "–" },
                { label: "Email", value: user?.email ?? "–" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-800 break-all">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <hr className="border-slate-100" />

            {/* Car details */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Vehicle
              </p>
              <div className="flex items-center gap-4">
                {car?.image && (
                  <div className="w-20 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Car",
                      value: car ? `${car.brand} ${car.model}` : "–",
                    },
                    { label: "Plate", value: car?.licensePlate ?? "–" },
                    { label: "Provider", value: provider?.name ?? "–" },
                    { label: "Color", value: car?.color ?? "–" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-medium text-slate-800">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Rental period */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Rental Period
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Pickup date",
                    value: formatDate(rental.rentalDate),
                  },
                  {
                    label: "Return date",
                    value: formatDate(rental.returnDate),
                  },
                  {
                    label: "Duration",
                    value: `${days} day${days > 1 ? "s" : ""}`,
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Amount */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  Daily rate × {days} days
                </p>
                <p className="text-sm text-slate-600">
                  ฿{car?.dailyRate?.toLocaleString() ?? "–"} × {days}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-0.5">Total paid</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ฿{rental.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center">
            <p className="text-xs text-slate-400">
              Thank you for choosing GoGo Rental · This is an official receipt
            </p>
          </div>
        </div>

        <div className="no-print mt-6 flex gap-3">
          <button
            onClick={() => router.push("/rentals")}
            className="btn-secondary text-sm"
          >
            Back to My Rentals
          </button>
        </div>
      </div>
    </>
  );
}
