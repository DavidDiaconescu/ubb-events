import { useSyncExternalStore } from "react";
import { api, ApiError, getToken, setToken } from "./api";
import { canManageEvent } from "./permissions";
import type {
  Announcement,
  AppNotification,
  AppState,
  EventOrganizer,
  Feedback,
  Membership,
  Organization,
  Registration,
  Task,
  UbbEvent,
  User,
  Venue,
} from "./types";

/**
 * Client-side copy of the backend data. Components read it with {@link useAppState};
 * the actions in `actions.ts` call the API and then reload it with {@link refreshState}.
 */

export type LoadStatus = "loading" | "ready" | "error";

interface StoreSnapshot {
  state: AppState;
  status: LoadStatus;
  /** Set when the last load failed. */
  error: string | null;
  /** True once the first load succeeded; later reloads keep showing the previous data. */
  loaded: boolean;
}

const EMPTY_STATE: AppState = {
  currentUserId: null,
  users: [],
  organizations: [],
  memberships: [],
  venues: [],
  events: [],
  eventOrganizers: [],
  registrations: [],
  tasks: [],
  announcements: [],
  notifications: [],
  feedback: [],
};

const SERVER_SNAPSHOT: StoreSnapshot = { state: EMPTY_STATE, status: "loading", error: null, loaded: false };

let snapshot: StoreSnapshot = SERVER_SNAPSHOT;
let latestLoadId = 0;
const listeners = new Set<() => void>();

function update(changes: Partial<StoreSnapshot>): void {
  snapshot = { ...snapshot, ...changes };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): AppState {
  return snapshot.state;
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => snapshot.state, () => SERVER_SNAPSHOT.state);
}

export function useStoreStatus(): Omit<StoreSnapshot, "state"> {
  const current = useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
  return { status: current.status, error: current.error, loaded: current.loaded };
}

export function useCurrentUser(): User | null {
  const state = useAppState();
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

/**
 * Reloads everything from the backend. When several reloads overlap, only the newest one is applied.
 * Errors are stored in the snapshot (see {@link useStoreStatus}) and never thrown.
 */
export async function refreshState(): Promise<void> {
  const loadId = ++latestLoadId;
  update({ status: "loading" });
  try {
    const state = await loadState();
    if (loadId === latestLoadId) update({ state, status: "ready", error: null, loaded: true });
  } catch (error) {
    if (loadId !== latestLoadId) return;
    const message = error instanceof Error ? error.message : "The data could not be loaded.";
    update({ status: "error", error: message });
  }
}

async function loadState(): Promise<AppState> {
  const currentUser = await loadCurrentUser();

  const [events, organizations, venues] = await Promise.all([
    api.get<UbbEvent[]>("/api/events"),
    optional(api.get<Organization[]>("/api/organizations")),
    optional(api.get<Venue[]>("/api/venues")),
  ]);

  if (currentUser === null) {
    // Visitors only browse events (UC-15/UC-16); everything else needs a signed-in user.
    return { ...EMPTY_STATE, events, organizations, venues };
  }

  const [users, notifications, membershipLists, organizerLists, perEvent, assignedTasks] = await Promise.all([
    api.get<User[]>("/api/users"),
    optional(api.get<AppNotification[]>(`/api/users/${currentUser.id}/notifications`)),
    Promise.all(organizations.map((organization) =>
      optional(api.get<Membership[]>(`/api/organizations/${organization.id}/memberships`)))),
    Promise.all(events.map((event) => optional(api.get<EventOrganizer[]>(`/api/events/${event.id}/organizers`)))),
    Promise.all(events.map((event) => loadEventDetails(event.id))),
    optional(api.get<Task[]>(`/api/users/${currentUser.id}/tasks`)),
  ]);
  const memberships = membershipLists.flat();
  const eventOrganizers = organizerLists.flat();

  // The task list of an event is only readable by its managers: asking for the others would just fail with 403.
  const managed = { ...EMPTY_STATE, memberships, eventOrganizers };
  const managedTaskLists = await Promise.all(events
    .filter((event) => canManageEvent(managed, currentUser, event))
    .map((event) => optional(api.get<Task[]>(`/api/events/${event.id}/tasks`))));

  return {
    currentUserId: currentUser.id,
    users,
    organizations,
    memberships,
    venues,
    events,
    eventOrganizers,
    registrations: perEvent.flatMap((details) => details.registrations),
    tasks: uniqueById([...managedTaskLists.flat(), ...assignedTasks]),
    announcements: perEvent.flatMap((details) => details.announcements),
    notifications,
    feedback: perEvent.flatMap((details) => details.feedback),
  };
}

function uniqueById<T extends { id: number }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

async function loadCurrentUser(): Promise<User | null> {
  if (!getToken()) return null;
  try {
    return await api.get<User>("/api/auth/me");
  } catch (error) {
    // Expired or invalid token, or a disabled account: continue as a visitor.
    if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
      setToken(null);
      return null;
    }
    throw error;
  }
}

async function loadEventDetails(eventId: number) {
  const [registrations, announcements, feedback] = await Promise.all([
    optional(api.get<Registration[]>(`/api/events/${eventId}/registrations`)),
    optional(api.get<Announcement[]>(`/api/events/${eventId}/announcements`)),
    optional(api.get<Feedback[]>(`/api/events/${eventId}/feedback`)),
  ]);
  return { registrations, announcements, feedback };
}

/** Data the current user is not allowed to see (401/403) or that is missing (404) is simply left out. */
async function optional<T>(request: Promise<T[]>): Promise<T[]> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) return [];
    throw error;
  }
}
