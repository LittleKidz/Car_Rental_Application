"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";

function MockBankContent() {
  const params = useSearchParams();
  const router = useRouter();
  const ref = params.get("ref") ?? "";
  const amount = Number(params.get("amount") ?? 0);

  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [secs, setSecs] = useState(600);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSecs((s) => s - 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const expired = secs <= 0;
  const mm = String(Math.floor(Math.max(secs, 0) / 60)).padStart(2, "0");
  const ss = String(Math.max(secs, 0) % 60).padStart(2, "0");

  const handleConfirm = async () => {
    if (!ref || confirming || expired) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/webhooks/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, status: "paid" }),
      }).then((r) => r.json());

      if (res.success) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDone(true);
        setTimeout(() => router.push(`/rentals/${ref}/receipt`), 2000);
      } else {
        setError(res.message || "Payment failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setConfirming(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden border border-slate-200">
        {/* Bank header */}
        <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v2h20V7L12 2zm-8 9v8h3v-8H4zm5 0v8h3v-8H9zm5 0v8h3v-8h-3zm5 0v8h3v-8h-3zM2 20h20v2H2v-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                GoGo Mock Bank
              </p>
              <p className="text-[11px] text-slate-400">
                Secure Payment Gateway
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-medium">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4z" />
            </svg>
            SSL
          </div>
        </div>

        {done ? (
          /* Success state */
          <div className="px-6 py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Payment Successful
            </h2>
            <p className="text-sm text-slate-500">
              Redirecting to your receipt…
            </p>
          </div>
        ) : (
          <>
            {/* Merchant */}
            <div className="px-5 pt-5 pb-3 border-b border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Merchant
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  GG
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    GoGo Rental
                  </p>
                  <p className="text-xs text-slate-400">
                    gogorental.vercel.app
                  </p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Amount
              </p>
              <p className="text-3xl font-bold text-slate-900">
                <span className="text-lg font-medium text-slate-500 mr-1">
                  THB
                </span>
                {amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Details */}
            <div className="px-5 py-4 border-b border-slate-100 space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Details
              </p>
              {[
                { label: "Booking ID", value: ref, mono: true },
                { label: "Payment Method", value: "QR Transfer" },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span
                    className={`text-xs font-medium text-slate-800 ${mono ? "font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded" : ""}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Timer */}
            <div className="px-5 py-3 border-b border-slate-100">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${expired ? "bg-red-50" : "bg-amber-50"}`}
              >
                <svg
                  className={`w-4 h-4 shrink-0 ${expired ? "text-red-500" : "text-amber-500"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5 5v6.25l5.5 3.27-.75 1.23L11 14V7h1.5z" />
                </svg>
                <span
                  className={`text-xs flex-1 ${expired ? "text-red-600" : "text-amber-700"}`}
                >
                  {expired ? "This request has expired" : "Request expires in"}
                </span>
                <span
                  className={`text-lg font-bold font-mono ${expired ? "text-red-600" : secs < 60 ? "text-red-500" : "text-amber-600"}`}
                >
                  {mm}:{ss}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-5 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="p-5 space-y-2.5">
              <button
                onClick={handleConfirm}
                disabled={confirming || expired}
                className="btn-primary w-full py-3.5 text-sm"
              >
                {confirming
                  ? "Processing…"
                  : `Confirm Payment · ฿${amount.toLocaleString()}`}
              </button>
              <button
                onClick={() => router.push("/")}
                className="btn-secondary w-full py-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MockBankPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MockBankContent />
    </Suspense>
  );
}
