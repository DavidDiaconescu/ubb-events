import type {
  Audience,
  EventCategory,
  EventStatus,
  OrganizerRole,
  OrgRole,
  RegistrationStatus,
  TaskStatus,
} from "./types";

/** Human-readable names for the backend enum values. */

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  WORKSHOP: "Workshop",
  CONFERENCE: "Conference",
  TRAINING: "Training",
  SOCIAL: "Social",
  COMPETITION: "Competition",
  OTHER: "Other",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  PUBLISHED: "Registration open",
  REGISTRATION_CLOSED: "Registration closed",
  ONGOING: "Happening now",
  FINISHED: "Finished",
  ARCHIVED: "Archived",
  CANCELLED: "Cancelled",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  CONFIRMED: "Confirmed",
  WAITLISTED: "On waitlist",
  CANCELLED: "Cancelled",
  CANCELLED_BY_ORGANIZER: "Cancelled by organizer",
  ATTENDED: "Attended",
  ABSENT: "Absent",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const AUDIENCE_LABELS: Record<Audience, string> = {
  ALL_REGISTERED: "Everyone registered (incl. waitlist)",
  CONFIRMED_ONLY: "Confirmed participants only",
  ORGANIZERS: "Organizing team only",
};

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  MEMBER: "Member",
  COORDINATOR: "Coordinator",
};

export const ORGANIZER_ROLE_LABELS: Record<OrganizerRole, string> = {
  LEAD: "Lead organizer",
  ORGANIZER: "Organizer",
};
