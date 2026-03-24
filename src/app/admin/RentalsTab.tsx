"use client";

import { useEffect, useState } from "react";
import type { Rental, Provider, Car, User } from "@/types";
import { useToast, Toast } from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";
import DateRangeDisplay from "@/components/ui/DateRangeDisplay";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { toInputDate } from "@/libs/utils";

export default function RentalsTab({ token }: { token: string }) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPickup, setEditPickup] = useState("");
  const [editReturn, setEditReturn] = useState("");
  const [toast, showToast] = useToast();

  const load = async () => {
    const res = await fetch("/api/rentals", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) setRentals(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rental?")) return;
    const res = await fetch(`/api/rentals/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) { showToast("Deleted!"); load(); }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/rentals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rentalDate: editPickup, returnDate: editReturn }),
    }).then((r) => r.json());
    if (res.success) { showToast("Updated!"); setEditId(null); load(); }
    else showToast(res.message || "Failed to update");
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Toast message={toast} />
      <h2 className="text-lg font-semibold text-slate-800 mb-6">All Rentals ({rentals.length})</h2>

      {rentals.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No rentals found.</div>
      ) : (
        <div className="space-y-4 stagger-children">
          {rentals.map((r) => {
            const prov = r.provider as Provider;
            const car = r.car as Car | undefined;
            const user = r.user as User;

            return (
              <div key={r._id} className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {car?.image && (
                    <div className="sm:w-48 h-32 sm:h-auto shrink-0 bg-slate-100">
                      <img src={car.image} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{car ? `${car.brand} ${car.model}` : "Car"}</h3>
                        {car && <span className="text-xs text-slate-400">{car.licensePlate}</span>}
                      </div>
                      <p className="text-sm text-slate-500">{user?.name} ({user?.email})</p>
                      <p className="text-sm text-slate-500 mt-1">Provider: {prov?.name || "Unknown"}</p>

                      {editId === r._id ? (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <DateRangePicker compact pickup={editPickup} returnDate={editReturn} onPickupChange={setEditPickup} onReturnChange={setEditReturn} />
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => handleUpdate(r._id)} className="btn-primary text-xs px-3 py-1.5">Save</button>
                            <button onClick={() => setEditId(null)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <DateRangeDisplay pickup={r.rentalDate} returnDate={r.returnDate} dailyRate={car?.dailyRate} />
                        </div>
                      )}
                    </div>

                    {editId !== r._id && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setEditId(r._id); setEditPickup(toInputDate(r.rentalDate)); setEditReturn(toInputDate(r.returnDate)); }} className="btn-secondary text-xs px-3 py-2">Edit</button>
                        <button onClick={() => handleDelete(r._id)} className="btn-danger text-xs px-3 py-2">Delete</button>
                      </div>
                    )}
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
