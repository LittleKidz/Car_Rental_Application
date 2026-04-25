"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { Review } from "@/types";
import StarRating from "@/components/ui/StarRating";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast, Toast } from "@/components/ui/Toast";

interface Props {
  providerId: string;
  initialReviews: Review[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ReviewSection({ providerId, initialReviews }: Props) {
  const [selectedRentalId, setSelectedRentalId] = useState("");
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [canReview, setCanReview] = useState(false);
  const [hasCompletedRentals, setHasCompletedRentals] = useState(true);
  const [availableRentals, setAvailableRentals] = useState<
    {
      _id: string;
      rentalDate: string;
      returnDate: string;
      car?: {
        brand: string;
        model: string;
        licensePlate: string;
        image?: string;
      };
    }[]
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });
  const [toast, showToast] = useToast();

  const token = session?.user.token ?? "";
  const userId = session?.user._id ?? "";
  const isAdmin = session?.user.role === "admin";

  const fetchReviews = async () => {
    const res = await fetch(`/api/providers/${providerId}/reviews`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    }).then((r) => r.json());
    if (res.success) {
      setReviews(res.data);
    }
  };

  const checkCanReview = async () => {
    if (!token) return;
    const res = await fetch(`/api/providers/${providerId}/reviews/can-review`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    if (res.success) {
      setCanReview(res.data.canReview);
      setHasCompletedRentals(res.data.hasCompletedRentals ?? true);
      setAvailableRentals(res.data.availableRentals);
      if (res.data.availableRentals.length > 0) {
        setSelectedRentalId(res.data.availableRentals[0]._id);
      }
    }
  };

  useEffect(() => {
    if (session) checkCanReview();
  }, [session]);

  const resetForm = () => {
    setRating(0);
    setComment("");
    setRatingError("");
    setShowForm(false);
    setEditId(null);
    setSelectedRentalId("");
  };

  const handleSubmit = async () => {
    if (!rating) {
      setRatingError("Please select a rating");
      return;
    }
    setRatingError("");
    setSubmitting(true);

    if (editId) {
      // Update existing review
      const res = await fetch(
        `/api/providers/${providerId}/reviews/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        },
      ).then((r) => r.json());

      if (res.success) {
        showToast("Review updated!");
        resetForm();
        fetchReviews();
      } else showToast(res.message || "Failed to update review");
    } else {
      // Create new review
      const rentalId = selectedRentalId || availableRentals[0]?._id;
      const res = await fetch(`/api/providers/${providerId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment, rentalId }),
      }).then((r) => r.json());

      if (res.success) {
        showToast("Review submitted!");
        resetForm();
        fetchReviews();
        checkCanReview();
      } else showToast(res.message || "Failed to submit review");
    }
    setSubmitting(false);
  };

  const handleEdit = (review: Review) => {
    setEditId(review._id);
    setRating(review.rating);
    setComment(review.comment ?? "");
    setRatingError("");
    setShowForm(true);
  };

  const handleDelete = (reviewId: string) => {
    setDialog({
      open: true,
      title: "Delete Review",
      message:
        "Delete this review permanently? The provider's average rating will be recalculated.",
      onConfirm: async () => {
        setDialog((d) => ({ ...d, open: false }));
        const res = await fetch(
          `/api/providers/${providerId}/reviews/${reviewId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        ).then((r) => r.json());
        if (res.success) {
          showToast("Review deleted");
          fetchReviews();
        } else showToast(res.message || "Failed to delete");
      },
    });
  };

  const avgRating = reviews.length
    ? Math.round(
        (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
      ) / 10
    : 0;

  return (
    <div className="mt-12">
      <Toast message={toast} />
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        variant="danger"
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog((d) => ({ ...d, open: false }))}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avgRating)} size="sm" readonly />
              <span className="text-sm font-semibold text-slate-700">
                {avgRating}
              </span>
              <span className="text-sm text-slate-400">
                ({reviews.length} review{reviews.length > 1 ? "s" : ""})
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mt-1">No reviews yet</p>
          )}
        </div>
        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm"
          >
            Write a Review
          </button>
        )}
        {session && !canReview && !hasCompletedRentals && !showForm && (
          <p className="text-sm text-slate-400">
            Only completed rentals can be reviewed
          </p>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card p-6 mb-6 animate-fade-in-up">
          <h3 className="font-semibold text-slate-800 mb-4">
            {editId ? "Edit Your Review" : "Write a Review"}
          </h3>
          {/* Rental selector */}
          {!editId && availableRentals.length > 1 && (
            <div className="mb-4">
              <label className="label">Select Rental</label>
              <select
                className="input-field"
                value={selectedRentalId}
                onChange={(e) => setSelectedRentalId(e.target.value)}
              >
                {availableRentals.map((r: any) => (
                  <option key={r._id} value={r._id}>
                    {r.car?.brand} {r.car?.model} · {r.car?.licensePlate} ·{" "}
                    {new Date(r.rentalDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {" → "}
                    {new Date(r.returnDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!editId &&
            availableRentals.length === 1 &&
            (availableRentals[0] as any).car && (
              <div className="mb-4 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-400 mb-0.5">
                  Reviewing rental
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {(availableRentals[0] as any).car?.brand}{" "}
                  {(availableRentals[0] as any).car?.model} ·{" "}
                  {(availableRentals[0] as any).car?.licensePlate}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(availableRentals[0].rentalDate).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" },
                  )}
                  {" → "}
                  {new Date(availableRentals[0].returnDate).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" },
                  )}
                </p>
              </div>
            )}
          <div className="mb-4">
            <label className="label mb-2">Rating *</label>
            <StarRating
              value={rating}
              onChange={(v) => {
                setRating(v);
                setRatingError("");
              }}
              size="lg"
            />
            {ratingError && (
              <p className="text-xs text-red-500 mt-1">{ratingError}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="label">Comment (optional)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting
                ? "Submitting…"
                : editId
                  ? "Update Review"
                  : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card p-10 text-center text-slate-400 text-sm">
          No reviews yet. Be the first to review after completing a rental.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const user = typeof review.user === "object" ? review.user : null;
            const isOwner =
              userId && user && (user as { _id: string })._id === userId;
            return (
              <div key={review._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                      {(user as { name: string })?.name
                        ?.charAt(0)
                        .toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {(user as { name: string })?.name ?? "User"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StarRating value={review.rating} size="sm" readonly />
                    {isOwner && !showForm && (
                      <>
                        <button
                          onClick={() => handleEdit(review)}
                          className="btn-secondary text-xs px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="btn-danger text-xs px-2 py-1"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {isAdmin && !isOwner && (
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="btn-danger text-xs px-2 py-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {review.comment}
                  </p>
                )}
                {(review.rental as any)?.car && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    {(review.rental as any).car?.image && (
                      <img
                        src={(review.rental as any).car.image}
                        alt=""
                        className="w-10 h-8 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        {(review.rental as any).car?.brand}{" "}
                        {(review.rental as any).car?.model} ·{" "}
                        {(review.rental as any).car?.licensePlate}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate((review.rental as any).rentalDate)} →{" "}
                        {formatDate((review.rental as any).returnDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
