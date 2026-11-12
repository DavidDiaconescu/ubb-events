import type { AppState, Organization, UbbEvent, User } from "./types";

/**
 * Role checks used by the UI and by the mock API.
 *
 * Actors:
 *  - Student: any signed-in user; discovers events and registers.
 *  - Coordinator: a COORDINATOR member of an organization; creates and manages its events.
 *  - Event organizer: a user added to an event's organizing team.
 *  - Administrator: global ADMIN role; approves events and manages organizations and users.
 */

export function isAdmin(user: User | null): boolean {
  return user?.globalRole === "ADMIN";
}

export function isActiveMember(state: AppState, userId: number, organizationId: number): boolean {
  return state.memberships.some(
    (membership) =>
      membership.userId === userId && membership.organizationId === organizationId && membership.active,
  );
}

export function isCoordinator(state: AppState, userId: number, organizationId: number): boolean {
  return state.memberships.some(
    (membership) =>
      membership.userId === userId &&
      membership.organizationId === organizationId &&
      membership.active &&
      membership.role === "COORDINATOR",
  );
}

export function isEventOrganizer(state: AppState, userId: number, eventId: number): boolean {
  return state.eventOrganizers.some(
    (organizer) => organizer.userId === userId && organizer.eventId === eventId,
  );
}

export function canManageEvent(state: AppState, user: User | null, event: UbbEvent): boolean {
  if (user === null) {
    return false;
  }
  return (
    isAdmin(user) ||
    isCoordinator(state, user.id, event.organizationId) ||
    isEventOrganizer(state, user.id, event.id)
  );
}

/** Organizations for which the user may create new events. */
export function organizationsUserCanCreateEventsFor(state: AppState, user: User | null): Organization[] {
  if (user === null) {
    return [];
  }
  return state.organizations.filter(
    (organization) =>
      organization.status === "ACTIVE" &&
      (isAdmin(user) || isCoordinator(state, user.id, organization.id)),
  );
}

/** Events in these statuses are still being prepared and are visible only to their managers. */
const INTERNAL_STATUSES = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);

export function isVisibleToParticipants(event: UbbEvent): boolean {
  return !INTERNAL_STATUSES.has(event.status);
}

export function canViewEvent(state: AppState, user: User | null, event: UbbEvent): boolean {
  return isVisibleToParticipants(event) || canManageEvent(state, user, event);
}

/** A short description of what the user can do, e.g. "Coordinator · UBB Tech Society". */
export function describeRole(state: AppState, user: User): string {
  if (isAdmin(user)) return "Administrator";

  const coordinatedOrganizations = state.memberships
    .filter((membership) => membership.userId === user.id && membership.active && membership.role === "COORDINATOR")
    .map((membership) => state.organizations.find((organization) => organization.id === membership.organizationId)?.name)
    .filter((name): name is string => name !== undefined);

  if (coordinatedOrganizations.length > 0) {
    return `Coordinator · ${coordinatedOrganizations.join(", ")}`;
  }
  return "Student";
}

/** Whether the "Manage" area is relevant for the user at all. */
export function hasOrganizerAccess(state: AppState, user: User | null): boolean {
  if (user === null) {
    return false;
  }
  return (
    isAdmin(user) ||
    state.memberships.some(
      (membership) => membership.userId === user.id && membership.active && membership.role === "COORDINATOR",
    ) ||
    state.eventOrganizers.some((organizer) => organizer.userId === user.id)
  );
}
