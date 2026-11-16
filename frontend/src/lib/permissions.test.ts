import { describe, expect, it } from "vitest";
import { ALLOWED_TRANSITIONS, requiresAdmin } from "./event-lifecycle";
import { canManageEvent, canViewEvent, hasOrganizerAccess, organizationsUserCanCreateEventsFor } from "./permissions";
import type { AppState, UbbEvent, User } from "./types";

/** The UI must show the same actions the backend's AccessPolicy allows. */

function user(id: number, globalRole: User["globalRole"] = "USER"): User {
  return {
    id, email: `user${id}@stud.ubbcluj.ro`, firstName: "First", lastName: "Last", faculty: "FMI",
    studyYear: 2, globalRole, enabled: true, createdAt: "2026-09-01T08:00:00Z",
  };
}

function event(status: UbbEvent["status"]): UbbEvent {
  return {
    id: 10, organizationId: 1, venueId: null, createdById: 2, title: "Workshop", description: "",
    category: "WORKSHOP", startTime: "2027-01-10T16:00:00Z", endTime: "2027-01-10T19:00:00Z", capacity: 30,
    registrationOpensAt: "2027-01-01T08:00:00Z", registrationClosesAt: "2027-01-09T20:00:00Z",
    visibility: "PUBLIC", status, cancellationReason: null, version: 0, createdAt: "2026-11-01T08:00:00Z",
  };
}

const admin = user(1, "ADMIN");
const coordinator = user(2);
const organizer = user(3);
const student = user(4);

const state: AppState = {
  currentUserId: null,
  users: [admin, coordinator, organizer, student],
  organizations: [
    { id: 1, name: "Tech", description: "", logoUrl: null, contactEmail: "t@example.com", status: "ACTIVE", createdAt: "" },
    { id: 2, name: "Suspended", description: "", logoUrl: null, contactEmail: "s@example.com", status: "SUSPENDED", createdAt: "" },
  ],
  memberships: [
    { id: 1, userId: 2, organizationId: 1, role: "COORDINATOR", joinedAt: "", active: true },
    { id: 2, userId: 2, organizationId: 2, role: "COORDINATOR", joinedAt: "", active: true },
    { id: 3, userId: 4, organizationId: 1, role: "MEMBER", joinedAt: "", active: true },
  ],
  venues: [],
  events: [],
  eventOrganizers: [{ id: 1, eventId: 10, userId: 3, role: "ORGANIZER" }],
  registrations: [],
  tasks: [],
  announcements: [],
  notifications: [],
  feedback: [],
};

describe("permissions", () => {
  it("administrators, coordinators and the event's organizers manage an event", () => {
    const draft = event("DRAFT");
    expect(canManageEvent(state, admin, draft)).toBe(true);
    expect(canManageEvent(state, coordinator, draft)).toBe(true);
    expect(canManageEvent(state, organizer, draft)).toBe(true);
    expect(canManageEvent(state, student, draft)).toBe(false);
    expect(canManageEvent(state, null, draft)).toBe(false);
  });

  it("events in preparation are hidden from participants", () => {
    for (const status of ["DRAFT", "PENDING_APPROVAL", "APPROVED"] as const) {
      expect(canViewEvent(state, student, event(status))).toBe(false);
      expect(canViewEvent(state, coordinator, event(status))).toBe(true);
    }
    expect(canViewEvent(state, null, event("PUBLISHED"))).toBe(true);
  });

  it("events can only be created for active organizations the user coordinates", () => {
    expect(organizationsUserCanCreateEventsFor(state, coordinator).map((o) => o.id)).toEqual([1]);
    expect(organizationsUserCanCreateEventsFor(state, student)).toEqual([]);
    expect(organizationsUserCanCreateEventsFor(state, admin).map((o) => o.id)).toEqual([1]);
  });

  it("only users with an organizing role see the Manage area", () => {
    expect(hasOrganizerAccess(state, organizer)).toBe(true);
    expect(hasOrganizerAccess(state, student)).toBe(false);
  });
});

describe("event lifecycle", () => {
  it("approving or rejecting a pending event requires an administrator", () => {
    expect(requiresAdmin("PENDING_APPROVAL", "APPROVED")).toBe(true);
    expect(requiresAdmin("PENDING_APPROVAL", "DRAFT")).toBe(true);
    expect(requiresAdmin("PENDING_APPROVAL", "CANCELLED")).toBe(false);
    expect(requiresAdmin("DRAFT", "PENDING_APPROVAL")).toBe(false);
  });

  it("finished, archived and cancelled events cannot go back", () => {
    expect(ALLOWED_TRANSITIONS.FINISHED).toEqual(["ARCHIVED"]);
    expect(ALLOWED_TRANSITIONS.ARCHIVED).toEqual([]);
    expect(ALLOWED_TRANSITIONS.CANCELLED).toEqual([]);
  });
});
