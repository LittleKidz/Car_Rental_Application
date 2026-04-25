"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Rental, Provider, Car } from "@/types";
import { toInputDate, calcDays, formatDate } from "@/libs/utils";
import { useToast, Toast } from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";
import DateRangeDisplay from "@/components/ui/DateRangeDisplay";
import DateRangePicker from "@/components/ui/DateRangePicker";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  refunded: "bg-slate-50 text-slate-500 border-slate-200",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Payment",
  paid: "Paid",
  refunded: "Refunded",
};

function isCompleted(r: Rental) {
  return new Date(r.returnDate) < new Date() || r.paymentStatus === "refunded";
}

export default function RentalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPickup, setEditPickup] = useState("");
  const [editReturn, setEditReturn] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant?: "danger" | "primary";
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
  const [toast, showToast] = useToast();

  const token = session?.user.token ?? "";

  const fetchRentals = async () => {
    if (!token) return;
    try {
      const data = await fetch("/api/rentals", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (data.success) setRentals(data.data);
    } catch (err) {
      console.error("Failed to fetch rentals:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchRentals();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, token]);

  const handleDelete = async (id: string) => {
    setDialog({
      open: true,
      title: "Delete Rental",
      message: "Are you sure you want to delete this rental?",
      variant: "danger",
      onConfirm: async () => {
        closeDialog();
        const res = await fetch(`/api/rentals/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        if (res.success) {
          showToast("Rental deleted");
          fetchRentals();
        }
      },
    });
  };

  const handleUpdate = async (id: string) => {
    if (new Date(editReturn) <= new Date(editPickup)) {
      showToast("Return date must be after pickup date");
      return;
    }
    const res = await fetch(`/api/rentals/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rentalDate: editPickup, returnDate: editReturn }),
    }).then((r) => r.json());

    if (res.success) {
      showToast("Rental updated");
      setEditId(null);
      fetchRentals();
    } else showToast(res.message || "Failed to update");
  };

  const handleCancel = async (id: string) => {
    setDialog({
      open: true,
      title: "Cancel Booking",
      message:
        "Cancel this booking and request a refund? Only bookings at least 3 days before pickup can be cancelled.",
      variant: "danger",
      onConfirm: async () => {
        closeDialog();
        setCancelling(id);
        const res = await fetch(`/api/rentals/${id}/cancel`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        if (res.success) {
          showToast("Booking cancelled.");
          fetchRentals();
        } else showToast(res.message || "Cannot cancel");
        setCancelling(null);
      },
    });
  };

  if (loading) return <Loading />;

  const activeRentals = rentals.filter((r) => !isCompleted(r));
  const pastRentals = rentals.filter((r) => isCompleted(r));

  const RentalCard = (r: Rental) => {
    const prov = r.provider as Provider;
    const car = r.car as Car | undefined;
    const isPending = r.paymentStatus === "pending";
    const isPaid = r.paymentStatus === "paid";
    const days = calcDays(r.rentalDate, r.returnDate);
    const canCancel =
      isPaid &&
      r.refundStatus === "none" &&
      (new Date(r.rentalDate).getTime() - Date.now()) / 86_400_000 >= 3;
    const completed = isCompleted(r);

    return (
      <div
        key={r._id}
        className={`card overflow-hidden ${completed ? "opacity-70" : ""}`}
      >
        <div className="flex flex-col sm:flex-row">
          {car?.image && (
            <div className="sm:w-48 h-32 sm:h-auto shrink-0 bg-slate-100">
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-slate-900">
                  {car ? `${car.brand} ${car.model}` : "Car"}
                </h3>
                {car && (
                  <span className="text-xs text-slate-400">
                    {car.licensePlate}
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${PAYMENT_STATUS_STYLES[r.paymentStatus]}`}
                >
                  {PAYMENT_STATUS_LABELS[r.paymentStatus]}
                </span>
                {completed && r.paymentStatus !== "refunded" && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Provider: {prov?.name || "Unknown"}
              </p>

              {editId === r._id ? (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <DateRangePicker
                    compact
                    pickup={editPickup}
                    returnDate={editReturn}
                    onPickupChange={setEditPickup}
                    onReturnChange={setEditReturn}
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleUpdate(r._id)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <DateRangeDisplay
                    pickup={r.rentalDate}
                    returnDate={r.returnDate}
                    dailyRate={car?.dailyRate}
                  />
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    Total: ฿
                    {r.totalAmount?.toLocaleString() ??
                      (car ? (car.dailyRate * days).toLocaleString() : "–")}
                  </p>
                  {r.refundStatus !== "none" && (
                    <p className="text-xs text-slate-400 mt-1">
                      Refund:{" "}
                      <span className="font-medium capitalize">
                        {r.refundStatus}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {editId !== r._id && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isPending && !completed && (
                  <button
                    onClick={() => router.push(`/rentals/${r._id}/payment`)}
                    className="btn-primary text-xs px-3 py-2"
                  >
                    Pay Now
                  </button>
                )}
                {isPaid && (
                  <button
                    onClick={() => router.push(`/rentals/${r._id}/receipt`)}
                    className="btn-secondary text-xs px-3 py-2"
                  >
                    Receipt
                  </button>
                )}
                {isPending && !completed && (
                  <button
                    onClick={() => {
                      setEditId(r._id);
                      setEditPickup(toInputDate(r.rentalDate));
                      setEditReturn(toInputDate(r.returnDate));
                    }}
                    className="btn-secondary text-xs px-3 py-2"
                  >
                    Edit
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => handleCancel(r._id)}
                    disabled={cancelling === r._id}
                    className="btn-danger text-xs px-3 py-2"
                  >
                    {cancelling === r._id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
                {isPending && !completed && (
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="btn-danger text-xs px-3 py-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <Toast message={toast} />

      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Rentals</h1>
        <p className="text-slate-500">Manage your car rental bookings</p>
      </div>

      {rentals.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="mb-4">No rentals yet.</p>
          <a href="/providers" className="btn-primary text-sm">
            Browse Providers
          </a>
        </div>
      ) : (
        <>
          {/* Active Rentals */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Active Bookings
              <span className="text-sm font-normal text-slate-400">
                ({activeRentals.length})
              </span>
            </h2>
            {activeRentals.length === 0 ? (
              <div className="card p-8 text-center text-slate-400 text-sm">
                No active bookings.{" "}
                <a href="/providers" className="text-indigo-500 underline">
                  Browse providers
                </a>
              </div>
            ) : (
              <div className="space-y-4 stagger-children">
                {activeRentals.map((r) => RentalCard(r))}
              </div>
            )}
          </div>

          {/* Past Rentals */}
          {pastRentals.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4 w-full text-left"
              >
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                History
                <span className="text-sm font-normal text-slate-400">
                  ({pastRentals.length})
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${showHistory ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showHistory && (
                <div className="space-y-4 stagger-children">
                  {pastRentals.map((r) => RentalCard(r))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDialog {...dialog} onCancel={closeDialog} />
    </div>
  );
}
