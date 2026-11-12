import type { EventStatus } from "./types";

/**
 * The event lifecycle. Identical to EventService.ALLOWED_TRANSITIONS in the backend.
 * PENDING_APPROVAL -> DRAFT means the administrator rejected the event.
 */
export const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "DRAFT", "CANCELLED"],
  APPROVED: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["REGISTRATION_CLOSED", "ONGOING", "CANCELLED"],
  REGISTRATION_CLOSED: ["PUBLISHED", "ONGOING", "CANCELLED"],
  ONGOING: ["FINISHED"],
  FINISHED: ["ARCHIVED"],
  ARCHIVED: [],
  CANCELLED: [],
};

/** The main path through the lifecycle, used to draw the progress indicator. */
export const LIFECYCLE_STEPS: EventStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PUBLISHED",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "FINISHED",
  "ARCHIVED",
];

/** Only an administrator can decide on an event that is waiting for approval. */
export function requiresAdmin(from: EventStatus, to: EventStatus): boolean {
  return from === "PENDING_APPROVAL" && (to === "APPROVED" || to === "DRAFT");
}

/** Statuses in which the event details can still be edited (same as the backend). */
export const EDITABLE_STATUSES: EventStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PUBLISHED",
  "REGISTRATION_CLOSED",
];

export function transitionLabel(from: EventStatus, to: EventStatus): string {
  if (to === "CANCELLED") return "Cancel event";
  if (from === "PENDING_APPROVAL" && to === "DRAFT") return "Reject";
  if (from === "REGISTRATION_CLOSED" && to === "PUBLISHED") return "Reopen registration";

  const labels: Partial<Record<EventStatus, string>> = {
    PENDING_APPROVAL: "Submit for approval",
    APPROVED: "Approve",
    PUBLISHED: "Publish",
    REGISTRATION_CLOSED: "Close registration",
    ONGOING: "Start event",
    FINISHED: "Mark as finished",
    ARCHIVED: "Archive",
  };
  return labels[to] ?? to;
}
