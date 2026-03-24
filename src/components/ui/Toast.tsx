"use client";

import { useState, useCallback } from "react";

/**
 * Hook that manages a transient toast message.
 * Returns `[message, showToast]`.
 *
 * @example
 * const [toast, showToast] = useToast();
 * showToast("Saved!");
 * // …
 * <Toast message={toast} />
 */
export function useToast(duration = 3000) {
  const [message, setMessage] = useState("");

  const showToast = useCallback(
    (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(""), duration);
    },
    [duration],
  );

  return [message, showToast] as const;
}

/** Renders a toast notification fixed at the bottom-right. */
export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 shadow-xl rounded-xl px-5 py-3 text-sm text-slate-700 animate-fade-in-up">
      {message}
    </div>
  );
}
