import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, filterEvents, hasActiveFilters, type EventFilters } from "./event-filters";
import type { AppState, UbbEvent } from "./types";

const NOW = Date.parse("2026-11-16T12:00:00Z");

function event(id: number, overrides: Partial<UbbEvent> = {}): UbbEvent {
  return {
    id, organizationId: 1, venueId: null, createdById: 1, title: `Event ${id}`, description: "",
    category: "WORKSHOP", startTime: "2026-11-20T16:00:00Z", endTime: "2026-11-20T19:00:00Z", capacity: 30,
    registrationOpensAt: "2026-11-01T08:00:00Z", registrationClosesAt: "2026-11-19T20:00:00Z",
    visibility: "PUBLIC", status: "PUBLISHED", cancellationReason: null, version: 0, createdAt: "",
    ...overrides,
  };
}

const state = {
  organizations: [{ id: 1, name: "UBB Tech Society" }, { id: 2, name: "Debate Club" }],
  events: [
    event(1, { title: "Spring Boot Workshop", startTime: "2026-11-25T16:00:00Z", endTime: "2026-11-25T18:00:00Z" }),
    event(2, { title: "Debate Cup", organizationId: 2, category: "COMPETITION" }),
    event(3, { title: "Old Training", startTime: "2026-10-01T10:00:00Z", endTime: "2026-10-01T12:00:00Z", status: "FINISHED" }),
    event(4, { title: "Draft", status: "DRAFT" }),
    event(5, { title: "Cancelled Social", status: "CANCELLED", category: "SOCIAL" }),
    event(6, { title: "Closed Talk", status: "REGISTRATION_CLOSED" }),
  ],
} as unknown as AppState;

const ids = (filters: Partial<EventFilters>) =>
  filterEvents(state, { ...DEFAULT_FILTERS, ...filters }, NOW).map((item) => item.id);

describe("filterEvents", () => {
  it("shows upcoming visible events, soonest first, hiding drafts and cancelled events", () => {
    expect(ids({})).toEqual([2, 6, 1]);
  });

  it("can include cancelled events", () => {
    expect(ids({ showCancelled: true })).toContain(5);
  });

  it("past events are listed separately", () => {
    expect(ids({ time: "past" })).toEqual([3]);
  });

  it("searches title, description and organization name", () => {
    expect(ids({ search: "spring" })).toEqual([1]);
    expect(ids({ search: "debate club" })).toEqual([2]);
  });

  it("filters by category, organization and open registration", () => {
    expect(ids({ category: "COMPETITION" })).toEqual([2]);
    expect(ids({ organizationId: "2" })).toEqual([2]);
    expect(ids({ openOnly: true })).toEqual([2, 1]);
  });

  it("knows when filters differ from the defaults", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, openOnly: true })).toBe(true);
  });
});
