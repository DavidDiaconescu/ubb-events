import { ALLOWED_TRANSITIONS, EDITABLE_STATUSES, requiresAdmin } from "./event-lifecycle";
import { validateEventInput, type EventInput } from "./event-validation";
import { createSeedState } from "./mock-data";
import { canManageEvent, isActiveMember, isAdmin, isCoordinator, isEventOrganizer } from "./permissions";
import { getState, replaceState } from "./store";
import type {
  AppState,
  Audience,
  EventStatus,
  NotificationType,
  OrganizerRole,
  OrgStatus,
  Registration,
  RegistrationStatus,
  TaskStatus,
  UbbEvent,
  User,
  Venue,
} from "./types";

/**
 * Mock implementation of the backend API. Every function applies the same business rules as the
 * corresponding Spring service, so the UI behaves as it will once it is connected to the backend.
 * A rule violation throws a {@link MockApiError} with a message that can be shown to the user.
 */

export class MockApiError extends Error {}

const ACTIVE_REGISTRATION_STATUSES: RegistrationStatus[] = ["CONFIRMED", "WAITLISTED"];
const LATE_CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;
const CHECK_IN_EVENT_STATUSES: EventStatus[] = ["PUBLISHED", "REGISTRATION_CLOSED", "ONGOING"];
const FEEDBACK_EVENT_STATUSES: EventStatus[] = ["FINISHED", "ARCHIVED"];

// ---------------------------------------------------------------- session & demo

export function signIn(userId: number): void {
  transaction((state) => {
    const user = findUser(state, userId);
    if (!user.enabled) {
      throw new MockApiError("This account is disabled.");
    }
    state.currentUserId = userId;
  });
}

export function signOut(): void {
  transaction((state) => {
    state.currentUserId = null;
  });
}

/** Restores the initial demo data but keeps the current user signed in. */
export function resetDemoData(): void {
  const currentUserId = getState().currentUserId;
  replaceState({ ...createSeedState(), currentUserId });
}

// ---------------------------------------------------------------- registrations

export function registerForEvent(eventId: number): Registration {
  return transaction((state) => {
    const user = requireCurrentUser(state);
    const event = findEvent(state, eventId);
    const now = Date.now();

    if (!user.enabled) throw new MockApiError("Your account is disabled.");
    if (event.status !== "PUBLISHED") {
      throw new MockApiError("This event is not accepting registrations.");
    }
    if (now < Date.parse(event.registrationOpensAt) || now >= Date.parse(event.registrationClosesAt)) {
      throw new MockApiError("The registration period for this event is not open.");
    }
    if (event.visibility === "MEMBERS_ONLY" && !isActiveMember(state, user.id, event.organizationId)) {
      throw new MockApiError("This event is open only to members of the organization.");
    }
    if (findActiveRegistration(state, eventId, user.id)) {
      throw new MockApiError("You are already registered for this event.");
    }

    const isFull = countTakenPlaces(state, eventId) >= event.capacity;
    const registration: Registration = {
      id: nextId(state.registrations),
      eventId,
      userId: user.id,
      status: isFull ? "WAITLISTED" : "CONFIRMED",
      waitlistPosition: isFull ? countByStatus(state, eventId, "WAITLISTED") + 1 : null,
      checkInCode: generateCheckInCode(),
      registeredAt: new Date(now).toISOString(),
      checkedInAt: null,
      lateCancellation: false,
    };
    state.registrations.push(registration);

    if (!isFull) {
      notify(state, user.id, eventId, "REGISTRATION_CONFIRMED",
        `Your registration for '${event.title}' is confirmed.`);
    }
    return registration;
  });
}

export function cancelRegistration(registrationId: number): void {
  transaction((state) => {
    const user = requireCurrentUser(state);
    const registration = state.registrations.find((item) => item.id === registrationId);
    if (!registration || registration.userId !== user.id) {
      throw new MockApiError("Registration not found.");
    }
    if (!ACTIVE_REGISTRATION_STATUSES.includes(registration.status)) {
      throw new MockApiError("This registration can no longer be cancelled.");
    }

    const event = findEvent(state, registration.eventId);
    const now = Date.now();
    const start = Date.parse(event.startTime);
    if (now >= start) {
      throw new MockApiError("The event has already started; the registration can no longer be cancelled.");
    }

    const releasedConfirmedPlace = registration.status === "CONFIRMED";
    registration.status = "CANCELLED";
    registration.waitlistPosition = null;
    registration.lateCancellation = now > start - LATE_CANCELLATION_WINDOW_MS;

    if (releasedConfirmedPlace) {
      fillFreePlacesFromWaitlist(state, event);
    } else {
      renumberWaitlist(state, event.id);
    }
  });
}

export function checkIn(eventId: number, checkInCode: string): Registration {
  return transaction((state) => {
    const event = findEvent(state, eventId);
    requireEventManager(state, event);

    if (!CHECK_IN_EVENT_STATUSES.includes(event.status)) {
      throw new MockApiError("Check-in is not possible in the current event status.");
    }

    const code = checkInCode.trim().toUpperCase();
    const registration = state.registrations.find(
      (item) => item.eventId === eventId && item.checkInCode === code,
    );
    if (!registration) {
      throw new MockApiError("No registration with this check-in code exists for this event.");
    }
    if (registration.status === "ATTENDED") {
      throw new MockApiError("This participant has already been checked in.");
    }
    if (registration.status !== "CONFIRMED") {
      throw new MockApiError("Only confirmed registrations can be checked in.");
    }

    registration.status = "ATTENDED";
    registration.checkedInAt = new Date().toISOString();
    return registration;
  });
}

// ---------------------------------------------------------------- events

/** Creates the event as a DRAFT; the creator becomes its LEAD organizer. Returns the new id. */
export function createEvent(input: EventInput): number {
  return transaction((state) => {
    const user = requireCurrentUser(state);
    const organization = state.organizations.find((item) => item.id === input.organizationId);
    if (!organization) throw new MockApiError("Organization not found.");
    if (organization.status !== "ACTIVE") {
      throw new MockApiError("This organization is suspended and cannot create events.");
    }
    if (!isAdmin(user) && !isCoordinator(state, user.id, organization.id)) {
      throw new MockApiError("Only coordinators of the organization can create events.");
    }

    ensureValid(input, findVenueOrNull(state, input.venueId));
    if (Date.parse(input.startTime) <= Date.now()) {
      throw new MockApiError("The event must start in the future.");
    }

    const event: UbbEvent = {
      id: nextId(state.events),
      ...trimEventInput(input),
      createdById: user.id,
      status: "DRAFT",
      cancellationReason: null,
      version: 0,
      createdAt: new Date().toISOString(),
    };
    state.events.push(event);
    state.eventOrganizers.push({ id: nextId(state.eventOrganizers), eventId: event.id, userId: user.id, role: "LEAD" });
    return event.id;
  });
}

/** {@code version} is the version the form was loaded with (optimistic locking, like the backend). */
export function updateEvent(eventId: number, input: EventInput, version: number): void {
  transaction((state) => {
    const event = findEvent(state, eventId);
    requireEventManager(state, event);

    if (event.version !== version) {
      throw new MockApiError("The event was modified by someone else. Reload it and try again.");
    }
    if (!EDITABLE_STATUSES.includes(event.status)) {
      throw new MockApiError("The event can no longer be edited.");
    }

    ensureValid(input, findVenueOrNull(state, input.venueId));
    const takenPlaces = countTakenPlaces(state, eventId);
    if (input.capacity < takenPlaces) {
      throw new MockApiError(`The capacity cannot be lower than the ${takenPlaces} places already taken.`);
    }

    // The organization of an event cannot be changed.
    Object.assign(event, { ...trimEventInput(input), organizationId: event.organizationId });
    event.version += 1;

    fillFreePlacesFromWaitlist(state, event);
    for (const userId of activeParticipantIds(state, eventId)) {
      notify(state, userId, eventId, "EVENT_UPDATED", `The event '${event.title}' was updated.`);
    }
  });
}

export function changeEventStatus(eventId: number, newStatus: EventStatus, cancellationReason?: string): void {
  transaction((state) => {
    const user = requireCurrentUser(state);
    const event = findEvent(state, eventId);
    const oldStatus = event.status;

    if (requiresAdmin(oldStatus, newStatus)) {
      if (!isAdmin(user)) throw new MockApiError("Only an administrator can approve or reject events.");
    } else {
      requireEventManager(state, event);
    }
    if (!ALLOWED_TRANSITIONS[oldStatus].includes(newStatus)) {
      throw new MockApiError(`The event status cannot change from ${oldStatus} to ${newStatus}.`);
    }

    if (newStatus === "CANCELLED") {
      const reason = cancellationReason?.trim() ?? "";
      if (reason === "") throw new MockApiError("A cancellation reason is required.");
      if (reason.length > 255) throw new MockApiError("The reason can have at most 255 characters.");
      event.cancellationReason = reason;
      cancelActiveRegistrationsByOrganizer(state, event);
    }
    if (newStatus === "FINISHED") {
      markAbsentParticipants(state, event.id);
    }

    event.status = newStatus;
    event.version += 1;

    if (newStatus === "PENDING_APPROVAL") {
      for (const admin of state.users.filter((item) => item.globalRole === "ADMIN")) {
        notify(state, admin.id, eventId, "APPROVAL_REQUEST", `The event '${event.title}' is waiting for approval.`);
      }
    }
    if (oldStatus === "PENDING_APPROVAL" && newStatus === "APPROVED") {
      notify(state, event.createdById, eventId, "APPROVAL_RESULT", `Your event '${event.title}' was approved.`);
    }
    if (oldStatus === "PENDING_APPROVAL" && newStatus === "DRAFT") {
      notify(state, event.createdById, eventId, "APPROVAL_RESULT",
        `Your event '${event.title}' was not approved and was returned to draft.`);
    }
  });
}

// ---------------------------------------------------------------- organizers, tasks, announcements

export function addOrganizer(eventId: number, userId: number, role: OrganizerRole): void {
  transaction((state) => {
    const event = findEvent(state, eventId);
    requireEventManager(state, event);
    const user = findUser(state, userId);
    if (!user.enabled) throw new MockApiError("This user is disabled.");
    if (isEventOrganizer(state, userId, eventId)) {
      throw new MockApiError("This user is already an organizer of the event.");
    }
    state.eventOrganizers.push({ id: nextId(state.eventOrganizers), eventId, userId, role });
  });
}

export function removeOrganizer(eventOrganizerId: number): void {
  transaction((state) => {
    const organizer = state.eventOrganizers.find((item) => item.id === eventOrganizerId);
    if (!organizer) throw new MockApiError("Organizer not found.");
    requireEventManager(state, findEvent(state, organizer.eventId));
    state.eventOrganizers = state.eventOrganizers.filter((item) => item.id !== eventOrganizerId);
  });
}

export interface TaskInput {
  assigneeId: number;
  title: string;
  description: string;
  dueDate: string;
}

export function createTask(eventId: number, input: TaskInput): void {
  transaction((state) => {
    const event = findEvent(state, eventId);
    requireEventManager(state, event);
    const title = input.title.trim();
    if (title === "") throw new MockApiError("The task title is required.");
    if (!isEventOrganizer(state, input.assigneeId, eventId)) {
      throw new MockApiError("Tasks can only be assigned to organizers of the event.");
    }

    state.tasks.push({
      id: nextId(state.tasks),
      eventId,
      assigneeId: input.assigneeId,
      title,
      description: input.description.trim() || null,
      dueDate: input.dueDate || null,
      status: "TODO",
    });
    notify(state, input.assigneeId, eventId, "TASK_ASSIGNED", `You were assigned the task '${title}'.`);
  });
}

export function updateTaskStatus(taskId: number, status: TaskStatus): void {
  transaction((state) => {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) throw new MockApiError("Task not found.");
    requireEventManager(state, findEvent(state, task.eventId));
    task.status = status;
  });
}

export function deleteTask(taskId: number): void {
  transaction((state) => {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) throw new MockApiError("Task not found.");
    requireEventManager(state, findEvent(state, task.eventId));
    state.tasks = state.tasks.filter((item) => item.id !== taskId);
  });
}

export interface AnnouncementInput {
  title: string;
  content: string;
  audience: Audience;
}

export function createAnnouncement(eventId: number, input: AnnouncementInput): void {
  transaction((state) => {
    const user = requireCurrentUser(state);
    const event = findEvent(state, eventId);
    if (!isEventOrganizer(state, user.id, eventId)) {
      throw new MockApiError("Only organizers of the event can publish announcements.");
    }
    const title = input.title.trim();
    const content = input.content.trim();
    if (title === "" || content === "") throw new MockApiError("The title and the message are required.");

    state.announcements.push({
      id: nextId(state.announcements),
      eventId,
      authorId: user.id,
      title,
      content,
      audience: input.audience,
      sentAt: new Date().toISOString(),
    });

    for (const recipientId of announcementRecipientIds(state, eventId, input.audience)) {
      notify(state, recipientId, eventId, "ANNOUNCEMENT", `New announcement for '${event.title}': ${title}`);
    }
  });
}

// ---------------------------------------------------------------- feedback

export interface FeedbackInput {
  rating: number;
  comment: string;
  anonymous: boolean;
}

export function submitFeedback(eventId: number, input: FeedbackInput): void {
  transaction((state) => {
    const user = requireCurrentUser(state);
    const event = findEvent(state, eventId);
    if (!FEEDBACK_EVENT_STATUSES.includes(event.status)) {
      throw new MockApiError("Feedback can only be given after the event has finished.");
    }
    const attended = state.registrations.some(
      (item) => item.eventId === eventId && item.userId === user.id && item.status === "ATTENDED",
    );
    if (!attended) throw new MockApiError("Only participants who attended the event can give feedback.");
    if (state.feedback.some((item) => item.eventId === eventId && item.userId === user.id)) {
      throw new MockApiError("You have already given feedback for this event.");
    }
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new MockApiError("Choose a rating between 1 and 5 stars.");
    }

    state.feedback.push({
      id: nextId(state.feedback),
      eventId,
      userId: user.id,
      rating: input.rating,
      comment: input.comment.trim() || null,
      anonymous: input.anonymous,
      submittedAt: new Date().toISOString(),
    });
  });
}

// ---------------------------------------------------------------- organizations & memberships

export function joinOrganization(organizationId: number): void {
  transaction((state) => {
    const user = requireCurrentUser(state);
    const organization = state.organizations.find((item) => item.id === organizationId);
    if (!organization) throw new MockApiError("Organization not found.");
    if (organization.status !== "ACTIVE") {
      throw new MockApiError("This organization is suspended and cannot accept members.");
    }

    // Like the backend: an inactive membership is reactivated instead of creating a second one.
    const existing = state.memberships.find(
      (item) => item.userId === user.id && item.organizationId === organizationId,
    );
    if (existing?.active) throw new MockApiError("You are already a member of this organization.");

    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, { active: true, role: "MEMBER", joinedAt: now });
    } else {
      state.memberships.push({ id: nextId(state.memberships), userId: user.id, organizationId, role: "MEMBER", joinedAt: now, active: true });
    }
  });
}

export function leaveOrganization(organizationId: number): void {
  transaction((state) => {
    const user = requireCurrentUser(state);
    const membership = state.memberships.find(
      (item) => item.userId === user.id && item.organizationId === organizationId && item.active,
    );
    if (!membership) throw new MockApiError("You are not a member of this organization.");
    membership.active = false;
  });
}

// ---------------------------------------------------------------- administration

export function setOrganizationStatus(organizationId: number, status: OrgStatus): void {
  transaction((state) => {
    requireAdmin(state);
    const organization = state.organizations.find((item) => item.id === organizationId);
    if (!organization) throw new MockApiError("Organization not found.");
    organization.status = status;
  });
}

export function setUserEnabled(userId: number, enabled: boolean): void {
  transaction((state) => {
    const admin = requireAdmin(state);
    if (admin.id === userId && !enabled) throw new MockApiError("You cannot disable your own account.");
    findUser(state, userId).enabled = enabled;
  });
}

export interface VenueInput {
  name: string;
  address: string;
  maxCapacity: number | null;
  online: boolean;
}

export function createVenue(input: VenueInput): void {
  transaction((state) => {
    requireAdmin(state);
    const name = input.name.trim();
    const address = input.address.trim();
    if (name === "") throw new MockApiError("The venue name is required.");
    if (!input.online && address === "") throw new MockApiError("A physical venue must have an address.");
    if (input.maxCapacity !== null && (!Number.isInteger(input.maxCapacity) || input.maxCapacity <= 0)) {
      throw new MockApiError("The maximum capacity must be a positive whole number.");
    }
    state.venues.push({ id: nextId(state.venues), name, address: address || null, maxCapacity: input.maxCapacity, online: input.online });
  });
}

// ---------------------------------------------------------------- notifications

export function markNotificationAsRead(notificationId: number): void {
  transaction((state) => {
    const notification = state.notifications.find((item) => item.id === notificationId);
    if (notification) notification.read = true;
  });
}

export function markAllNotificationsAsRead(): void {
  transaction((state) => {
    const user = requireCurrentUser(state);
    state.notifications
      .filter((item) => item.recipientId === user.id)
      .forEach((item) => (item.read = true));
  });
}

// ---------------------------------------------------------------- internal helpers

/**
 * Runs {@code work} on a copy of the state and saves the copy only if no error was thrown,
 * so a failed operation never leaves half-applied changes (like a database transaction).
 */
function transaction<T>(work: (draft: AppState) => T): T {
  const draft = structuredClone(getState());
  const result = work(draft);
  replaceState(draft);
  return result;
}

function requireCurrentUser(state: AppState): User {
  const user = state.users.find((item) => item.id === state.currentUserId);
  if (!user) throw new MockApiError("Please sign in first.");
  return user;
}

function requireAdmin(state: AppState): User {
  const user = requireCurrentUser(state);
  if (!isAdmin(user)) throw new MockApiError("Only administrators can do this.");
  return user;
}

function requireEventManager(state: AppState, event: UbbEvent): void {
  if (!canManageEvent(state, requireCurrentUser(state), event)) {
    throw new MockApiError("You are not allowed to manage this event.");
  }
}

function findUser(state: AppState, userId: number): User {
  const user = state.users.find((item) => item.id === userId);
  if (!user) throw new MockApiError("User not found.");
  return user;
}

function findEvent(state: AppState, eventId: number): UbbEvent {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) throw new MockApiError("Event not found.");
  return event;
}

function findVenueOrNull(state: AppState, venueId: number | null): Venue | null {
  if (venueId === null) return null;
  const venue = state.venues.find((item) => item.id === venueId);
  if (!venue) throw new MockApiError("Venue not found.");
  return venue;
}

function findActiveRegistration(state: AppState, eventId: number, userId: number): Registration | undefined {
  return state.registrations.find(
    (item) => item.eventId === eventId && item.userId === userId && ACTIVE_REGISTRATION_STATUSES.includes(item.status),
  );
}

function countByStatus(state: AppState, eventId: number, status: RegistrationStatus): number {
  return state.registrations.filter((item) => item.eventId === eventId && item.status === status).length;
}

/** A place stays taken after check-in, so ATTENDED registrations count towards the capacity too. */
function countTakenPlaces(state: AppState, eventId: number): number {
  return countByStatus(state, eventId, "CONFIRMED") + countByStatus(state, eventId, "ATTENDED");
}

function activeParticipantIds(state: AppState, eventId: number): number[] {
  return state.registrations
    .filter((item) => item.eventId === eventId && ACTIVE_REGISTRATION_STATUSES.includes(item.status))
    .map((item) => item.userId);
}

function ensureValid(input: EventInput, venue: Venue | null): void {
  const firstError = Object.values(validateEventInput(input, venue))[0];
  if (firstError) throw new MockApiError(firstError);
}

function trimEventInput(input: EventInput): EventInput {
  return { ...input, title: input.title.trim(), description: input.description.trim() };
}

/** Promotes users from the waitlist while the event has free places. */
function fillFreePlacesFromWaitlist(state: AppState, event: UbbEvent): void {
  let freePlaces = event.capacity - countTakenPlaces(state, event.id);
  const waitlist = waitlistOf(state, event.id);

  for (const registration of waitlist) {
    if (freePlaces <= 0) break;
    registration.status = "CONFIRMED";
    registration.waitlistPosition = null;
    notify(state, registration.userId, event.id, "WAITLIST_PROMOTED",
      `A place became available: your registration for '${event.title}' is now confirmed.`);
    freePlaces--;
  }
  renumberWaitlist(state, event.id);
}

/** Keeps waitlist positions consecutive (1, 2, 3, ...). */
function renumberWaitlist(state: AppState, eventId: number): void {
  waitlistOf(state, eventId).forEach((registration, index) => {
    registration.waitlistPosition = index + 1;
  });
}

function waitlistOf(state: AppState, eventId: number): Registration[] {
  return state.registrations
    .filter((item) => item.eventId === eventId && item.status === "WAITLISTED")
    .sort((a, b) => (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0));
}

function cancelActiveRegistrationsByOrganizer(state: AppState, event: UbbEvent): void {
  for (const registration of state.registrations) {
    if (registration.eventId === event.id && ACTIVE_REGISTRATION_STATUSES.includes(registration.status)) {
      registration.status = "CANCELLED_BY_ORGANIZER";
      registration.waitlistPosition = null;
      notify(state, registration.userId, event.id, "EVENT_CANCELLED",
        `The event '${event.title}' was cancelled. Reason: ${event.cancellationReason}`);
    }
  }
}

function markAbsentParticipants(state: AppState, eventId: number): void {
  for (const registration of state.registrations) {
    if (registration.eventId === eventId && registration.status === "CONFIRMED") {
      registration.status = "ABSENT";
    }
  }
}

/** Same audience rules as AnnouncementService in the backend. */
function announcementRecipientIds(state: AppState, eventId: number, audience: Audience): number[] {
  if (audience === "ORGANIZERS") {
    return state.eventOrganizers.filter((item) => item.eventId === eventId).map((item) => item.userId);
  }
  const statuses: RegistrationStatus[] = audience === "ALL_REGISTERED"
    ? ["CONFIRMED", "WAITLISTED", "ATTENDED", "ABSENT"]
    : ["CONFIRMED", "ATTENDED", "ABSENT"];
  const userIds = state.registrations
    .filter((item) => item.eventId === eventId && statuses.includes(item.status))
    .map((item) => item.userId);
  return [...new Set(userIds)];
}

function notify(state: AppState, recipientId: number, eventId: number | null, type: NotificationType, message: string): void {
  state.notifications.push({
    id: nextId(state.notifications),
    recipientId,
    eventId,
    type,
    channel: "IN_APP",
    message: message.length > 255 ? `${message.slice(0, 252)}...` : message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

function nextId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

/** A short, human-readable code such as "UBB-7K2Q-41". */
function generateCheckInCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomValues = crypto.getRandomValues(new Uint32Array(6));
  const letters = Array.from(randomValues.slice(0, 4), (value) => alphabet[value % alphabet.length]).join("");
  const digits = Array.from(randomValues.slice(4), (value) => value % 10).join("");
  return `UBB-${letters}-${digits}`;
}
