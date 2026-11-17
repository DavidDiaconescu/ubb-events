import { useSyncExternalStore } from "react";
import { ApiError } from "./api";

export type ToastTone = "success" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const TOAST_DURATION_MS = 4_500;
const EMPTY: Toast[] = [];

let toasts: Toast[] = EMPTY;
let nextToastId = 1;
const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

export function showToast(message: string, tone: ToastTone = "success"): void {
  const toast: Toast = { id: nextToastId++, message, tone };
  toasts = [...toasts, toast];
  emitChange();
  window.setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emitChange();
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
    () => EMPTY,
  );
}

/** True while an action started with {@link runAction} has not finished. */
let actionInProgress = false;

/**
 * Runs an API call and reports the outcome with a toast.
 * Resolves to true if the call succeeded. While an action runs, further calls are ignored (resolve to false),
 * so a double click cannot send the same request twice. Unexpected errors are reported as a toast too.
 */
export async function runAction(action: () => Promise<unknown>, successMessage?: string): Promise<boolean> {
  if (actionInProgress) return false;
  actionInProgress = true;
  try {
    await action();
    if (successMessage) showToast(successMessage, "success");
    return true;
  } catch (error) {
    if (!(error instanceof ApiError)) console.error(error);
    showToast(error instanceof ApiError ? error.message : "Something went wrong. Please try again.", "error");
    return false;
  } finally {
    actionInProgress = false;
  }
}
