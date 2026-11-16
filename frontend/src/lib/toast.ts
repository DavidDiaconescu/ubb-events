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

/**
 * Runs an API call and reports the outcome with a toast.
 * Resolves to true if the call succeeded. Unexpected errors are re-thrown.
 */
export async function runAction(action: () => Promise<unknown>, successMessage?: string): Promise<boolean> {
  try {
    await action();
    if (successMessage) showToast(successMessage, "success");
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      showToast(error.message, "error");
      return false;
    }
    throw error;
  }
}
