"use client";

import { useEffect, useState } from "react";
import type { Provider } from "@/types";
import { useToast, Toast } from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

export default function ProvidersTab({ token }: { token: string }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", telephone: "" });
  const { dialog, closeDialog, openDialog } = useConfirmDialog();
  const [toast, showToast] = useToast();

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
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    }).then((r) => r.json());

    if (res.success) {
      showToast(editId ? "Updated!" : "Created!");
      resetForm();
      load();
    } else showToast("Error: " + (res.message || "Failed"));
  };

  const handleDelete = (id: string) => {
    openDialog({
      title: "Delete Provider",
      message: "Delete this provider and all its cars? This cannot be undone.",
      variant: "danger",
      onConfirm: async () => {
        closeDialog();
        const res = await fetch(`/api/providers/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        if (res.success) {
          showToast("Deleted!");
          load();
        } else showToast(res.message || "Failed to delete");
      },
    });
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Toast message={toast} />

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

      {showForm && (
        <Modal
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
        </Modal>
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

      <ConfirmDialog {...dialog} onCancel={closeDialog} />
    </div>
  );
}
