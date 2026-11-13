"use client";

import { CircleCheck, CircleX, X } from "lucide-react";
import { dismissToast, useToasts } from "@/lib/toast";

/** Shows the toasts created with `showToast` / `runAction`. */
export function Toaster() {
  const toasts = useToasts();

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => {
        const isError = toast.tone === "error";
        const Icon = isError ? CircleX : CircleCheck;
        return (
          <div
            key={toast.id}
            role={isError ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              isError ? "border-danger/30 bg-danger-soft text-foreground" : "border-success/30 bg-success-soft text-foreground"
            }`}
          >
            <Icon className={`mt-0.5 size-4 shrink-0 ${isError ? "text-danger" : "text-success"}`} aria-hidden="true" />
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded text-foreground/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Dismiss"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
