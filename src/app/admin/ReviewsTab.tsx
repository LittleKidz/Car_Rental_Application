"use client";

import { useEffect, useState } from "react";
import { useToast, Toast } from "@/components/ui/Toast";
import Loading from "@/components/ui/Loading";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StarRating from "@/components/ui/StarRating";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

interface AdminReview {
  _id: string;
  user: { name: string } | string;
  provider: { _id: string; name: string } | string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function ReviewsTab({ token }: { token: string }) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { dialog, closeDialog, openDialog } = useConfirmDialog();
  const [toast, showToast] = useToast();

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/reviews", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) setReviews(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (review: AdminReview) => {
    const providerId =
      typeof review.provider === "object" ? review.provider._id : review.provider;
    openDialog({
      title: "Delete Review",
      message:
        "Delete this review permanently? The provider's average rating will be recalculated.",
      variant: "danger",
      onConfirm: async () => {
        closeDialog();

        setReviews((prev) => prev.filter((r) => r._id !== review._id));

        const res = await fetch(
          `/api/providers/${providerId}/reviews/${review._id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        ).then((r) => r.json());

        if (res.success) {
          showToast("Review deleted");
        } else {
          showToast(res.message || "Failed to delete");
          load();
        }
      },
    });
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Toast message={toast} />
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        variant="danger"
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />

      <h2 className="text-lg font-semibold text-slate-800 mb-6">
        All Reviews ({reviews.length})
      </h2>

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {reviews.map((review) => {
            const user =
              typeof review.user === "object" ? review.user : null;
            const prov =
              typeof review.provider === "object" ? review.provider : null;
            return (
              <div key={review._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {user?.name ?? "User"}
                      </span>
                      <span className="text-xs text-slate-400">→</span>
                      <span className="text-sm font-medium text-indigo-600">
                        {prov?.name ?? "Provider"}
                      </span>
                      <StarRating value={review.rating} size="sm" readonly />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(review)}
                    className="btn-danger text-xs px-3 py-1.5 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
