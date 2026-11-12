import type { AppState, Registration, RegistrationStatus, UbbEvent } from "./types";

/** Read-only helpers for looking up related data in the mock state. */

export function findEventById(state: AppState, eventId: number): UbbEvent | undefined {
  return state.events.find((event) => event.id === eventId);
}

export function organizationName(state: AppState, organizationId: number): string {
  return state.organizations.find((organization) => organization.id === organizationId)?.name ?? "Unknown organization";
}

export function userDisplayName(state: AppState, userId: number): string {
  const user = state.users.find((item) => item.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : "Unknown user";
}

export function venueLabel(state: AppState, venueId: number | null): string {
  if (venueId === null) return "Venue to be announced";
  return state.venues.find((venue) => venue.id === venueId)?.name ?? "Unknown venue";
}

export function registrationsOf(state: AppState, eventId: number): Registration[] {
  return state.registrations.filter((registration) => registration.eventId === eventId);
}

export function countRegistrations(state: AppState, eventId: number, status: RegistrationStatus): number {
  return state.registrations.filter(
    (registration) => registration.eventId === eventId && registration.status === status,
  ).length;
}

/** Places in use: confirmed participants plus those already checked in. */
export function countTakenPlaces(state: AppState, eventId: number): number {
  return countRegistrations(state, eventId, "CONFIRMED") + countRegistrations(state, eventId, "ATTENDED");
}

/** The user's CONFIRMED or WAITLISTED registration for the event, if any. */
export function activeRegistrationOf(state: AppState, eventId: number, userId: number): Registration | undefined {
  return state.registrations.find(
    (registration) =>
      registration.eventId === eventId &&
      registration.userId === userId &&
      (registration.status === "CONFIRMED" || registration.status === "WAITLISTED"),
  );
}

/** The most recent registration of the user for the event (any status). */
export function latestRegistrationOf(state: AppState, eventId: number, userId: number): Registration | undefined {
  return state.registrations
    .filter((registration) => registration.eventId === eventId && registration.userId === userId)
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))[0];
}

export function averageRating(state: AppState, eventId: number): { average: number; count: number } {
  const ratings = state.feedback.filter((item) => item.eventId === eventId).map((item) => item.rating);
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return { average: ratings.length ? total / ratings.length : 0, count: ratings.length };
}

export function sortByStartTime(events: UbbEvent[]): UbbEvent[] {
  return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
}
