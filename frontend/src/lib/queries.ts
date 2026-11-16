import { canManageEvent } from "./permissions";
import type { Announcement, AppState, Registration, RegistrationStatus, UbbEvent, User } from "./types";

/** Read-only helpers for looking up related data in the loaded state. */

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

/** PUBLISHED and inside its registration period at time `now` (ms since epoch). */
export function isOpenForRegistration(event: UbbEvent, now: number): boolean {
  return (
    event.status === "PUBLISHED" &&
    Date.parse(event.registrationOpensAt) <= now &&
    now < Date.parse(event.registrationClosesAt)
  );
}

export function eventsOpenForRegistration(state: AppState, now: number): UbbEvent[] {
  return sortByStartTime(state.events.filter((event) => isOpenForRegistration(event, now)));
}

/** Newest first. */
export function announcementsOf(state: AppState, eventId: number): Announcement[] {
  return state.announcements
    .filter((announcement) => announcement.eventId === eventId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

/** The announcements the user received: same audience rules as the notifications sent by the backend. */
export function visibleAnnouncements(state: AppState, user: User | null, event: UbbEvent): Announcement[] {
  if (user === null) return [];
  if (canManageEvent(state, user, event)) return announcementsOf(state, event.id);

  const statuses = state.registrations
    .filter((registration) => registration.eventId === event.id && registration.userId === user.id)
    .map((registration) => registration.status);
  const isRegistered = statuses.some((status) => ["CONFIRMED", "WAITLISTED", "ATTENDED", "ABSENT"].includes(status));
  const isConfirmed = statuses.some((status) => ["CONFIRMED", "ATTENDED", "ABSENT"].includes(status));

  return announcementsOf(state, event.id).filter((announcement) =>
    announcement.audience === "ALL_REGISTERED" ? isRegistered
      : announcement.audience === "CONFIRMED_ONLY" ? isConfirmed
        : false);
}
