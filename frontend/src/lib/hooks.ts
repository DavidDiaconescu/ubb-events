import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** False during server rendering and hydration, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const MINUTE_MS = 60_000;

function subscribeToMinutes(onChange: () => void): () => void {
  const intervalId = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(intervalId);
}

/** Rounded down to the minute, so the value only changes once per minute. */
function currentMinute(): number {
  return Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;
}

/**
 * The current time in milliseconds, refreshed every minute.
 * Returns 0 on the server; pages are only rendered after hydration, so that value is never shown.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribeToMinutes, currentMinute, () => 0);
}
