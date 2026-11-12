import { useSyncExternalStore } from "react";
import { MockApiError } from "./mock-api";

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

/**
 * Runs a mock API call and reports the outcome with a toast.
 * Returns true if the call succeeded. Unexpected errors are re-thrown.
 */
export function runAction(action: () => void, successMessage?: string): boolean {
  try {
    action();
    if (successMessage) showToast(successMessage, "success");
    return true;
  } catch (error) {
    if (error instanceof MockApiError) {
      showToast(error.message, "error");
      return false;
    }
    throw error;
  }
}
