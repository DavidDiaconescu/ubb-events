/**
 * Domain types. They mirror the response DTOs of the Spring Boot backend
 * (ro.ubb.events.dto.*), so the mock data layer can later be replaced by real API calls.
 */

export type GlobalRole = "USER" | "ADMIN";
export type OrgRole = "MEMBER" | "COORDINATOR";
export type OrgStatus = "ACTIVE" | "SUSPENDED";
export type OrganizerRole = "LEAD" | "ORGANIZER";
export type Visibility = "PUBLIC" | "MEMBERS_ONLY";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Audience = "ALL_REGISTERED" | "CONFIRMED_ONLY" | "ORGANIZERS";

export type EventCategory =
  | "WORKSHOP"
  | "CONFERENCE"
  | "TRAINING"
  | "SOCIAL"
  | "COMPETITION"
  | "OTHER";

export type EventStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PUBLISHED"
  | "REGISTRATION_CLOSED"
  | "ONGOING"
  | "FINISHED"
  | "ARCHIVED"
  | "CANCELLED";

export type RegistrationStatus =
  | "CONFIRMED"
  | "WAITLISTED"
  | "CANCELLED"
  | "CANCELLED_BY_ORGANIZER"
  | "ATTENDED"
  | "ABSENT";

export type NotificationType =
  | "REGISTRATION_CONFIRMED"
  | "WAITLIST_PROMOTED"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"
  | "REMINDER"
  | "APPROVAL_REQUEST"
  | "APPROVAL_RESULT"
  | "ANNOUNCEMENT"
  | "TASK_ASSIGNED";

/** All dates are ISO-8601 strings (UTC), exactly as the backend serializes `Instant`. */
export type IsoDateTime = string;

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  faculty: string;
  studyYear: number;
  globalRole: GlobalRole;
  enabled: boolean;
  createdAt: IsoDateTime;
}

export interface Organization {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  contactEmail: string;
  status: OrgStatus;
  createdAt: IsoDateTime;
}

export interface Membership {
  id: number;
  userId: number;
  organizationId: number;
  role: OrgRole;
  joinedAt: IsoDateTime;
  active: boolean;
}

export interface Venue {
  id: number;
  name: string;
  address: string | null;
  maxCapacity: number | null;
  online: boolean;
}

/** Named `UbbEvent` to avoid confusion with the DOM `Event` type. */
export interface UbbEvent {
  id: number;
  organizationId: number;
  venueId: number | null;
  createdById: number;
  title: string;
  description: string;
  category: EventCategory;
  startTime: IsoDateTime;
  endTime: IsoDateTime;
  capacity: number;
  registrationOpensAt: IsoDateTime;
  registrationClosesAt: IsoDateTime;
  visibility: Visibility;
  status: EventStatus;
  cancellationReason: string | null;
  version: number;
  createdAt: IsoDateTime;
}

export interface EventOrganizer {
  id: number;
  eventId: number;
  userId: number;
  role: OrganizerRole;
}

export interface Registration {
  id: number;
  eventId: number;
  userId: number;
  status: RegistrationStatus;
  waitlistPosition: number | null;
  checkInCode: string;
  registeredAt: IsoDateTime;
  checkedInAt: IsoDateTime | null;
  lateCancellation: boolean;
}

export interface Task {
  id: number;
  eventId: number;
  assigneeId: number;
  title: string;
  description: string | null;
  /** Calendar date in the form YYYY-MM-DD (backend `LocalDate`). */
  dueDate: string | null;
  status: TaskStatus;
}

export interface Announcement {
  id: number;
  eventId: number;
  authorId: number;
  title: string;
  content: string;
  audience: Audience;
  sentAt: IsoDateTime;
}

/** Named `AppNotification` to avoid confusion with the browser `Notification` API. */
export interface AppNotification {
  id: number;
  recipientId: number;
  eventId: number | null;
  type: NotificationType;
  channel: "EMAIL" | "IN_APP";
  message: string;
  read: boolean;
  createdAt: IsoDateTime;
}

export interface Feedback {
  id: number;
  eventId: number;
  /** Always stored; hidden in the UI when the feedback is anonymous (the backend returns null). */
  userId: number;
  rating: number;
  comment: string | null;
  anonymous: boolean;
  submittedAt: IsoDateTime;
}

/** Everything the mock data layer keeps in memory. */
export interface AppState {
  currentUserId: number | null;
  users: User[];
  organizations: Organization[];
  memberships: Membership[];
  venues: Venue[];
  events: UbbEvent[];
  eventOrganizers: EventOrganizer[];
  registrations: Registration[];
  tasks: Task[];
  announcements: Announcement[];
  notifications: AppNotification[];
  feedback: Feedback[];
}
