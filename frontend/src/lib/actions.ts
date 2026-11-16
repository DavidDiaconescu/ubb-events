import { api, ApiError, setToken } from "./api";
import type { EventInput } from "./event-validation";
import { getState, refreshState } from "./store";
import type {
  Audience,
  EventStatus,
  OrganizerRole,
  OrgStatus,
  Registration,
  TaskStatus,
  UbbEvent,
  User,
} from "./types";

/**
 * The operations of the app, each one a call to the Spring Boot backend, which applies the
 * business rules and the access control (the user is taken from the JWT, never from the request body). After a change the local data is reloaded so every page shows the new state.
 * A rejected request throws an {@link ApiError} whose message can be shown to the user.
 */

// ---------------------------------------------------------------- session

interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function signIn(email: string, password: string): Promise<void> {
  const response = await api.post<LoginResponse>("/api/auth/login", { email: email.trim(), password });
  setToken(response.accessToken);
  await refreshState();
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  faculty: string;
  studyYear: number;
}

/** Creates the account and signs in with it. */
export async function registerAccount(input: RegisterInput): Promise<void> {
  await api.post<User>("/api/auth/register", {
    ...input,
    email: input.email.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    faculty: input.faculty.trim(),
  });
  await signIn(input.email, input.password);
}

export async function signOut(): Promise<void> {
  setToken(null);
  await refreshState();
}

// ---------------------------------------------------------------- registrations

export async function registerForEvent(eventId: number): Promise<Registration> {
  const registration = await api.post<Registration>(`/api/events/${eventId}/registrations`);
  await refreshState();
  return registration;
}

export async function cancelRegistration(registrationId: number): Promise<void> {
  await mutate(api.post(`/api/registrations/${registrationId}/cancel`));
}

export async function checkIn(eventId: number, checkInCode: string): Promise<Registration> {
  const registration = await api.post<Registration>(`/api/events/${eventId}/check-in`, {
    checkInCode: checkInCode.trim().toUpperCase(),
  });
  await refreshState();
  return registration;
}

// ---------------------------------------------------------------- events

/** Creates the event as a DRAFT; the creator becomes its LEAD organizer. Returns the new id. */
export async function createEvent(input: EventInput): Promise<number> {
  const event = await api.post<UbbEvent>("/api/events", trimEventInput(input));
  await refreshState();
  return event.id;
}

/** {@code version} is the version the form was loaded with (optimistic locking). */
export async function updateEvent(eventId: number, input: EventInput, version: number): Promise<void> {
  // The organization of an event cannot be changed, so it is not part of the update request.
  const details: Partial<EventInput> = trimEventInput(input);
  delete details.organizationId;
  await mutate(api.put(`/api/events/${eventId}`, { ...details, version }));
}

export async function changeEventStatus(
  eventId: number,
  status: EventStatus,
  cancellationReason?: string,
): Promise<void> {
  await mutate(api.patch(`/api/events/${eventId}/status`, {
    status,
    cancellationReason: cancellationReason?.trim() || null,
  }));
}

// ---------------------------------------------------------------- organizers, tasks, announcements

export async function addOrganizer(eventId: number, userId: number, role: OrganizerRole): Promise<void> {
  await mutate(api.post(`/api/events/${eventId}/organizers`, { userId, role }));
}

export async function removeOrganizer(eventOrganizerId: number): Promise<void> {
  await mutate(api.delete(`/api/event-organizers/${eventOrganizerId}`));
}

export interface TaskInput {
  assigneeId: number;
  title: string;
  description: string;
  dueDate: string;
}

export async function createTask(eventId: number, input: TaskInput): Promise<void> {
  await mutate(api.post(`/api/events/${eventId}/tasks`, {
    assigneeId: input.assigneeId,
    title: input.title.trim(),
    description: input.description.trim() || null,
    dueDate: input.dueDate || null,
  }));
}

export async function updateTaskStatus(taskId: number, status: TaskStatus): Promise<void> {
  await mutate(api.patch(`/api/tasks/${taskId}/status`, { status }));
}

export async function deleteTask(taskId: number): Promise<void> {
  await mutate(api.delete(`/api/tasks/${taskId}`));
}

export interface AnnouncementInput {
  title: string;
  content: string;
  audience: Audience;
}

export async function createAnnouncement(eventId: number, input: AnnouncementInput): Promise<void> {
  await mutate(api.post(`/api/events/${eventId}/announcements`, {
    title: input.title.trim(),
    content: input.content.trim(),
    audience: input.audience,
  }));
}

// ---------------------------------------------------------------- feedback

export interface FeedbackInput {
  rating: number;
  comment: string;
  anonymous: boolean;
}

export async function submitFeedback(eventId: number, input: FeedbackInput): Promise<void> {
  await mutate(api.post(`/api/events/${eventId}/feedback`, {
    rating: input.rating,
    comment: input.comment.trim() || null,
    anonymous: input.anonymous,
  }));
}

// ---------------------------------------------------------------- organizations & memberships

export async function joinOrganization(organizationId: number): Promise<void> {
  await mutate(api.post(`/api/organizations/${organizationId}/memberships`, {
    userId: requireCurrentUserId(),
    role: "MEMBER",
  }));
}

export async function leaveOrganization(organizationId: number): Promise<void> {
  const userId = requireCurrentUserId();
  const membership = getState().memberships.find(
    (item) => item.userId === userId && item.organizationId === organizationId && item.active,
  );
  if (!membership) throw new ApiError("You are not a member of this organization.", 404);
  await mutate(api.delete(`/api/memberships/${membership.id}`));
}

// ---------------------------------------------------------------- administration

export async function setOrganizationStatus(organizationId: number, status: OrgStatus): Promise<void> {
  await mutate(api.patch(`/api/organizations/${organizationId}/status`, { status }));
}

export async function setUserEnabled(userId: number, enabled: boolean): Promise<void> {
  if (userId === getState().currentUserId && !enabled) {
    throw new ApiError("You cannot disable your own account.", 400);
  }
  await mutate(api.patch(`/api/users/${userId}/enabled`, { enabled }));
}

export interface VenueInput {
  name: string;
  address: string;
  maxCapacity: number | null;
  online: boolean;
}

export async function createVenue(input: VenueInput): Promise<void> {
  await mutate(api.post("/api/venues", {
    name: input.name.trim(),
    address: input.address.trim() || null,
    maxCapacity: input.maxCapacity,
    online: input.online,
  }));
}

// ---------------------------------------------------------------- notifications

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await mutate(api.patch(`/api/notifications/${notificationId}/read`));
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await mutate(api.post(`/api/users/${requireCurrentUserId()}/notifications/read-all`));
}

// ---------------------------------------------------------------- helpers

/** Waits for the request, then reloads the data so the change is visible everywhere. */
async function mutate(request: Promise<unknown>): Promise<void> {
  await request;
  await refreshState();
}

function requireCurrentUserId(): number {
  const userId = getState().currentUserId;
  if (userId === null) throw new ApiError("Please sign in first.", 401);
  return userId;
}

function trimEventInput(input: EventInput): EventInput {
  return { ...input, title: input.title.trim(), description: input.description.trim() };
}
