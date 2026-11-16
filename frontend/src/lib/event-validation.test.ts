import { describe, expect, it } from "vitest";
import { validateEventInput, type EventInput } from "./event-validation";
import type { Venue } from "./types";

/** The same rules as EventService.validateDetails in the backend (BR-02 .. BR-04). */
function validInput(overrides: Partial<EventInput> = {}): EventInput {
  return {
    organizationId: 1,
    venueId: null,
    title: "Spring Boot Workshop",
    description: "Hands-on",
    category: "WORKSHOP",
    visibility: "PUBLIC",
    capacity: 30,
    registrationOpensAt: "2027-01-01T08:00:00Z",
    registrationClosesAt: "2027-01-09T20:00:00Z",
    startTime: "2027-01-10T16:00:00Z",
    endTime: "2027-01-10T19:00:00Z",
    ...overrides,
  };
}

const smallRoom: Venue = { id: 1, name: "Room 2/I", address: "Str. Kogălniceanu 1", maxCapacity: 20, online: false };

describe("validateEventInput", () => {
  it("accepts a valid event", () => {
    expect(validateEventInput(validInput(), null)).toEqual({});
  });

  it("requires a title and a description", () => {
    const errors = validateEventInput(validInput({ title: "  ", description: "" }), null);
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
  });

  it("requires a positive whole capacity", () => {
    expect(validateEventInput(validInput({ capacity: 0 }), null).capacity).toBeDefined();
    expect(validateEventInput(validInput({ capacity: 2.5 }), null).capacity).toBeDefined();
  });

  it("does not allow more participants than the venue holds", () => {
    expect(validateEventInput(validInput({ capacity: 21 }), smallRoom).capacity).toContain("20");
    expect(validateEventInput(validInput({ capacity: 20 }), smallRoom)).toEqual({});
  });

  it("BR-02: the event must end after it starts", () => {
    const errors = validateEventInput(validInput({ endTime: "2027-01-10T16:00:00Z" }), null);
    expect(errors.endTime).toBeDefined();
  });

  it("BR-03: registration must open before it closes", () => {
    const errors = validateEventInput(validInput({ registrationOpensAt: "2027-01-09T21:00:00Z" }), null);
    expect(errors.registrationClosesAt).toBeDefined();
  });

  it("BR-04: registration must close before the event starts", () => {
    const errors = validateEventInput(validInput({ registrationClosesAt: "2027-01-10T17:00:00Z" }), null);
    expect(errors.registrationClosesAt).toContain("before the event starts");
  });
});
