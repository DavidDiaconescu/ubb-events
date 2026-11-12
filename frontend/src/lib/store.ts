import { useSyncExternalStore } from "react";
import { createSeedState } from "./mock-data";
import type { AppState, User } from "./types";

/**
 * In-memory store for the mock data, persisted to localStorage so that demo changes
 * survive a page reload. Components read it with {@link useAppState}; only the functions
 * in `mock-api.ts` change it.
 */

const STORAGE_KEY = "ubb-events/mock-state/v1";

/** Rendered on the server and during hydration, before the browser state is available. */
const serverSnapshot: AppState = createSeedState();

let currentState: AppState | null = null;
const listeners = new Set<() => void>();

export function getState(): AppState {
  if (currentState === null) {
    currentState = readStoredState() ?? createSeedState();
  }
  return currentState;
}

export function replaceState(nextState: AppState): void {
  currentState = nextState;
  writeStoredState(nextState);
  listeners.forEach((listener) => listener());
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => serverSnapshot);
}

export function useCurrentUser(): User | null {
  const state = useAppState();
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStoredState(): AppState | null {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue ? (JSON.parse(storedValue) as AppState) : null;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); fall back to the seed data.
    return null;
  }
}

function writeStoredState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Not being able to persist only means changes are lost on reload.
  }
}
