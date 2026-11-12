"use client";

import { dismissToast, useToasts } from "@/lib/toast";

/** Shows the toasts created with `showToast` / `runAction`. */
export function Toaster() {
  const toasts = useToasts();

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.tone === "error"
              ? "border-danger/30 bg-danger-soft text-foreground"
              : "border-success/30 bg-success-soft text-foreground"
          }`}
        >
          <span aria-hidden="true" className={toast.tone === "error" ? "text-danger" : "text-success"}>
            {toast.tone === "error" ? "✕" : "✓"}
          </span>
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
