"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import type { Rental, Car, Provider } from "@/types";
import { calcDays, formatDate } from "@/libs/utils";
import { revalidateProvider } from "@/app/actions/revalidate";

const POLL_INTERVAL_MS = 3000;

export default function PaymentPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rental, setRental] = useState<Rental | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = session?.user.token ?? "";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!token) return;

    async function init() {
      try {
        const [rentalRes, qrRes] = await Promise.all([
          fetch(`/api/rentals/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`/api/rentals/${id}/qr`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);

        if (!rentalRes.success) {
          setError("Rental not found.");
          return;
        }
        if (rentalRes.data.paymentStatus === "paid") {
          router.replace(`/rentals/${id}/receipt`);
          return;
        }
        if (rentalRes.data.paymentStatus === "refunded") {
          router.replace("/rentals");
          return;
        }

        setRental(rentalRes.data);
        if (qrRes.success) {
          setQrUrl(qrRes.data.url);
        }
      } catch {
        setError("Failed to load payment details.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id, token, router]);

  // Polling for payment confirmation
  useEffect(() => {
    if (!token || loading) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/rentals/${id}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());

        if (res.success && res.data.paymentStatus === "paid") {
          if (pollRef.current) clearInterval(pollRef.current);
          const providerId =
            typeof rental?.provider === "object"
              ? (rental.provider as Provider)._id
              : rental?.provider;
          if (providerId) await revalidateProvider(providerId);
          router.push(`/rentals/${id}/receipt`);
        }
      } catch {
        // silently retry
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id, token, loading, router]);

  if (status === "loading" || loading) return <Loading />;
  if (error)
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">{error}</p>
      </div>
    );
  if (!rental) return null;

  const car = rental.car as Car | undefined;
  const provider = rental.provider as Provider;
  const days = calcDays(rental.rentalDate, rental.returnDate);
  const qrImageUrl = qrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
    : "";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Complete Payment
        </h1>
        <p className="text-slate-500">Scan the QR code to pay via Mock Bank</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* QR code card */}
        <div className="card p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Scan to Pay
          </p>

          {qrImageUrl ? (
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="Payment QR Code"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] bg-slate-100 rounded-xl animate-pulse" />
          )}

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              ฿{rental.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Waiting for confirmation…
            </p>
          </div>

          {/* Pulsing dot indicating polling */}
          <div className="flex items-center gap-2 text-xs text-indigo-500 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            Auto-detecting payment…
          </div>
        </div>

        {/* Booking summary */}
        <div className="card overflow-hidden">
          {car?.image && (
            <div className="h-32 bg-slate-100">
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-5 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                {car ? `${car.brand} ${car.model}` : "Your booking"}
              </h3>
              <p className="text-sm text-slate-500">{provider?.name}</p>
            </div>

            {[
              { label: "Pickup", value: formatDate(rental.rentalDate) },
              { label: "Return", value: formatDate(rental.returnDate) },
              { label: "Duration", value: `${days} day${days > 1 ? "s" : ""}` },
              {
                label: "Daily rate",
                value: `฿${car?.dailyRate?.toLocaleString() ?? "–"}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">
                Total
              </span>
              <span className="text-lg font-bold text-indigo-600">
                ฿{rental.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-sm font-medium text-indigo-800 mb-2">How to pay</p>
        <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
          <li>Scan the QR code with your phone camera</li>
          <li>Confirm the payment on the Mock Bank page</li>
          <li>This page will update automatically</li>
        </ol>
      </div>

      <button
        onClick={() => router.push("/rentals")}
        className="btn-secondary mt-6 text-sm"
      >
        Back to My Rentals
      </button>
    </div>
  );
}
