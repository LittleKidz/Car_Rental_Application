"use client";

import { useEffect, useState } from "react";
import type { Car, Provider } from "@/types";
import { useToast, Toast } from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";

const EMPTY_FORM = { brand: "", model: "", color: "", licensePlate: "", dailyRate: "", provider: "", available: true };

export default function CarsTab({ token }: { token: string }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, showToast] = useToast();

  const load = async () => {
    const [cRes, pRes] = await Promise.all([
      fetch("/api/cars").then((r) => r.json()),
      fetch("/api/providers").then((r) => r.json()),
    ]);
    if (cRes.success) setCars(cRes.data);
    if (pRes.success) setProviders(pRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/cars/${editId}` : `/api/providers/${form.provider}/cars`;
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        brand: form.brand, model: form.model, color: form.color,
        licensePlate: form.licensePlate, dailyRate: Number(form.dailyRate),
        available: form.available,
      }),
    }).then((r) => r.json());

    if (res.success) { showToast(editId ? "Updated!" : "Created!"); resetForm(); load(); }
    else showToast("Error: " + (res.message || "Failed"));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this car?")) return;
    const res = await fetch(`/api/cars/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) { showToast("Deleted!"); load(); }
  };

  const startEdit = (c: Car) => {
    setForm({
      brand: c.brand, model: c.model, color: c.color,
      licensePlate: c.licensePlate, dailyRate: String(c.dailyRate),
      provider: typeof c.provider === "string" ? c.provider : c.provider._id,
      available: c.available,
    });
    setEditId(c._id);
    setShowForm(true);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Toast message={toast} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Cars ({cars.length})</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">+ Add Car</button>
      </div>

      {showForm && (
        <Modal title={editId ? "Edit Car" : "New Car"} onClose={resetForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editId && (
              <div>
                <label className="label">Provider</label>
                <select className="input-field" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} required>
                  <option value="">Select provider...</option>
                  {providers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Brand</label><input className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required /></div>
              <div><label className="label">Model</label><input className="input-field" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Color</label><input className="input-field" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required /></div>
              <div><label className="label">License Plate</label><input className="input-field" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Daily Rate (฿)</label><input type="number" className="input-field" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} required min={0} /></div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">Available</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">{editId ? "Update" : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="space-y-3 stagger-children">
        {cars.map((c) => {
          const prov = c.provider as Provider;
          return (
            <div key={c._id} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{c.brand} {c.model}</h3>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${c.available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                    {c.available ? "available" : "unavailable"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{prov?.name || "—"} · {c.licensePlate} · {c.color} · ฿{c.dailyRate.toLocaleString()}/day</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(c)} className="btn-secondary text-xs px-3 py-1.5">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
