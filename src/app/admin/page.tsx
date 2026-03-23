"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Provider, Car, Rental, User } from "@/types";
import { Booking } from "@/types";

type Tab = "providers" | "cars" | "rentals";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("providers");

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-500">
          Manage providers, cars, and rental bookings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-100 rounded-xl p-1 w-fit">
        {(["providers", "cars", "rentals"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "providers" && <ProvidersTab token={session.user.token} />}
      {tab === "cars" && <CarsTab token={session.user.token} />}
      {tab === "rentals" && <RentalsTab token={session.user.token} />}
    </div>
  );
}

/* ─── PROVIDERS TAB ─── */
function ProvidersTab({ token }: { token: string }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", telephone: "" });
  const [toast, setToast] = useState("");

  const load = async () => {
    const res = await fetch("/api/providers").then((r) => r.json());
    if (res.success) setProviders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: "", address: "", telephone: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/providers/${editId}` : "/api/providers";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    }).then((r) => r.json());
    if (res.success) {
      setToast(editId ? "Updated!" : "Created!");
      resetForm();
      load();
    } else setToast("Error: " + (res.message || "Failed"));
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this provider and all its cars/rentals?")) return;
    const res = await fetch(`/api/providers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) {
      setToast("Deleted!");
      load();
    }
    setTimeout(() => setToast(""), 3000);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Toast msg={toast} />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Providers ({providers.length})
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary text-sm"
        >
          + Add Provider
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <FormModal
          title={editId ? "Edit Provider" : "New Provider"}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Address</label>
              <input
                className="input-field"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Telephone</label>
              <input
                className="input-field"
                value={form.telephone}
                onChange={(e) =>
                  setForm({ ...form, telephone: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="space-y-3 stagger-children">
        {providers.map((p) => (
          <div key={p._id} className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {p.name}
              </h3>
              <p className="text-sm text-slate-500 truncate">{p.address}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setForm({
                    name: p.name,
                    address: p.address,
                    telephone: p.telephone || "",
                  });
                  setEditId(p._id);
                  setShowForm(true);
                }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CARS TAB ─── */
function CarsTab({ token }: { token: string }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    color: "",
    licensePlate: "",
    dailyRate: "",
    provider: "",
    available: true,
  });
  const [toast, setToast] = useState("");

  const load = async () => {
    const [cRes, pRes] = await Promise.all([
      fetch("/api/cars").then((r) => r.json()),
      fetch("/api/providers").then((r) => r.json()),
    ]);
    if (cRes.success) setCars(cRes.data);
    if (pRes.success) setProviders(pRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      brand: "",
      model: "",
      color: "",
      licensePlate: "",
      dailyRate: "",
      provider: "",
      available: true,
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url: string, method: string;
    if (editId) {
      url = `/api/cars/${editId}`;
      method = "PUT";
    } else {
      url = `/api/providers/${form.provider}/cars`;
      method = "POST";
    }
    const body: Record<string, unknown> = {
      brand: form.brand,
      model: form.model,
      color: form.color,
      licensePlate: form.licensePlate,
      dailyRate: Number(form.dailyRate),
      available: form.available,
    };
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    if (res.success) {
      setToast(editId ? "Updated!" : "Created!");
      resetForm();
      load();
    } else setToast("Error: " + (res.message || "Failed"));
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this car?")) return;
    const res = await fetch(`/api/cars/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) {
      setToast("Deleted!");
      load();
    }
    setTimeout(() => setToast(""), 3000);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Toast msg={toast} />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Cars ({cars.length})
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary text-sm"
        >
          + Add Car
        </button>
      </div>

      {showForm && (
        <FormModal title={editId ? "Edit Car" : "New Car"} onClose={resetForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editId && (
              <div>
                <label className="label">Provider</label>
                <select
                  className="input-field"
                  value={form.provider}
                  onChange={(e) =>
                    setForm({ ...form, provider: e.target.value })
                  }
                  required
                >
                  <option value="">Select provider...</option>
                  {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Brand</label>
                <input
                  className="input-field"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Model</label>
                <input
                  className="input-field"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Color</label>
                <input
                  className="input-field"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">License Plate</label>
                <input
                  className="input-field"
                  value={form.licensePlate}
                  onChange={(e) =>
                    setForm({ ...form, licensePlate: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Daily Rate (฿)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.dailyRate}
                  onChange={(e) =>
                    setForm({ ...form, dailyRate: e.target.value })
                  }
                  required
                  min={0}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm({ ...form, available: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Available
                  </span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="space-y-3 stagger-children">
        {cars.map((c) => {
          const prov = c.provider as Provider;
          return (
            <div key={c._id} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {c.brand} {c.model}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${c.available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                  >
                    {c.available ? "available" : "unavailable"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {prov?.name || "—"} · {c.licensePlate} · {c.color} · ฿
                  {c.dailyRate.toLocaleString()}/day
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    setForm({
                      brand: c.brand,
                      model: c.model,
                      color: c.color,
                      licensePlate: c.licensePlate,
                      dailyRate: String(c.dailyRate),
                      provider:
                        typeof c.provider === "string"
                          ? c.provider
                          : c.provider._id,
                      available: c.available,
                    });
                    setEditId(c._id);
                    setShowForm(true);
                  }}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="btn-danger text-xs px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── RENTALS TAB ─── */
function RentalsTab({ token }: { token: string }) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [toast, setToast] = useState("");
  const [editPickup, setEditPickup] = useState("");
  const [editReturn, setEditReturn] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const today = new Date().toISOString().split("T")[0];

  const load = async () => {
    const res = await fetch("/api/rentals", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) setRentals(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rental?")) return;
    const res = await fetch(`/api/rentals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) {
      setToast("Deleted!");
      load();
    }
    setTimeout(() => setToast(""), 3000);
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/rentals/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rentalDate: editPickup, returnDate: editReturn }),
    }).then((r) => r.json());
    if (res.success) {
      setToast("Updated!");
      setEditId(null);
      load();
    }
    setTimeout(() => setToast(""), 3000);
  };
  const isCarBooked = (carId?: string): boolean => {
    if (!editPickup || !editReturn) return false;
    const pickup = new Date(editPickup);
    const ret = new Date(editReturn);
    return bookings.some((b) => {
      if (b.car !== carId) return false;
      return new Date(b.rentalDate) < ret && new Date(b.returnDate) > pickup;
    });
  };
  const datesSelected = !!(
    editPickup &&
    editReturn &&
    new Date(editReturn) > new Date(editPickup)
  );
  const calcDays = (pickup: string, ret: string) => {
    const diff = new Date(ret).getTime() - new Date(pickup).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Toast msg={toast} />
      <h2 className="text-lg font-semibold text-slate-800 mb-6">
        All Rentals ({rentals.length})
      </h2>

      {rentals.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No rentals found.
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {rentals.map((r) => {
            const prov = r.provider as Provider;
            const car = r.car as Car | undefined;
            const days = calcDays(r.rentalDate, r.returnDate);
            const user = r.user as User;
            const booked = datesSelected && isCarBooked(car?._id);

            return (
              <div key={r._id} className="card overflow-hidden">
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
                  <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">
                          {car ? `${car.brand} ${car.model}` : "Car"}
                        </h3>
                        {car && (
                          <span className="text-xs text-slate-400">
                            {car.licensePlate}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {user?.name} ({user?.email})
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Provider: {prov?.name || "Unknown"}
                      </p>

                      {editId === r._id ? (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <div>
                            <label className="text-xs text-slate-500">
                              Pickup
                            </label>
                            <input
                              type="date"
                              className="input-field"
                              value={editPickup}
                              onChange={(e) => {
                                setEditPickup(e.target.value);
                                if (editReturn && e.target.value >= editReturn)
                                  setEditReturn("");
                              }}
                              min={today}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">
                              Return
                            </label>
                            <input
                              type="date"
                              className="input-field"
                              value={editReturn}
                              onChange={(e) => setEditReturn(e.target.value)}
                              min={editPickup || today}
                              disabled={!editPickup}
                            />
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleUpdate(r._id)}
                              className="btn-primary text-xs px-3 py-1.5"
                              disabled={booked}
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
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm text-indigo-600 font-medium">
                            {new Date(r.rentalDate).toLocaleDateString("en-GB")}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="text-sm text-indigo-600 font-medium">
                            {new Date(r.returnDate).toLocaleDateString("en-GB")}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({days} day{days > 1 ? "s" : ""})
                          </span>
                          {car && (
                            <span className="text-sm font-semibold text-slate-700">
                              ฿{(car.dailyRate * days).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {editId !== r._id && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditId(r._id);
                            setEditPickup(
                              new Date(r.rentalDate)
                                .toISOString()
                                .split("T")[0],
                            );
                            setEditReturn(
                              new Date(r.returnDate)
                                .toISOString()
                                .split("T")[0],
                            );
                          }}
                          className="btn-secondary text-xs px-3 py-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="btn-danger text-xs px-3 py-2"
                        >
                          Delete
                        </button>
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

/* ─── Shared Components ─── */
function Loading() {
  return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 shadow-xl rounded-xl px-5 py-3 text-sm text-slate-700 animate-fade-in-up">
      {msg}
    </div>
  );
}

function FormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "fade-in-up 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-lg text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
