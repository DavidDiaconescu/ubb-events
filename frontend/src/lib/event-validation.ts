import type { EventCategory, IsoDateTime, Venue, Visibility } from "./types";

/** The editable fields of an event (mirrors CreateEventRequest / UpdateEventRequest). */
export interface EventInput {
  organizationId: number;
  venueId: number | null;
  title: string;
  description: string;
  category: EventCategory;
  visibility: Visibility;
  capacity: number;
  startTime: IsoDateTime;
  endTime: IsoDateTime;
  registrationOpensAt: IsoDateTime;
  registrationClosesAt: IsoDateTime;
}

export type EventInputErrors = Partial<Record<keyof EventInput, string>>;

/**
 * The same rules as the backend (bean validation + EventService.validateDetails, BR-02 .. BR-04).
 * Returns an empty object when the input is valid.
 */
export function validateEventInput(input: EventInput, venue: Venue | null): EventInputErrors {
  const errors: EventInputErrors = {};

  if (!input.organizationId) errors.organizationId = "Choose the organizing organization.";
  if (input.title.trim() === "") errors.title = "The title is required.";
  else if (input.title.length > 255) errors.title = "The title can have at most 255 characters.";
  if (input.description.trim() === "") errors.description = "The description is required.";

  if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
    errors.capacity = "The capacity must be a positive whole number.";
  } else if (venue?.maxCapacity != null && input.capacity > venue.maxCapacity) {
    errors.capacity = `The venue holds at most ${venue.maxCapacity} people.`;
  }

  const start = Date.parse(input.startTime);
  const end = Date.parse(input.endTime);
  const opens = Date.parse(input.registrationOpensAt);
  const closes = Date.parse(input.registrationClosesAt);

  if (Number.isNaN(start)) errors.startTime = "Choose when the event starts.";
  if (Number.isNaN(end)) errors.endTime = "Choose when the event ends.";
  if (Number.isNaN(opens)) errors.registrationOpensAt = "Choose when registration opens.";
  if (Number.isNaN(closes)) errors.registrationClosesAt = "Choose when registration closes.";

  if (!errors.startTime && !errors.endTime && end <= start) {
    errors.endTime = "The event must end after it starts.";
  }
  if (!errors.registrationOpensAt && !errors.registrationClosesAt && opens >= closes) {
    errors.registrationClosesAt = "Registration must close after it opens.";
  }
  if (!errors.registrationClosesAt && !errors.startTime && closes > start) {
    errors.registrationClosesAt = "Registration must close before the event starts.";
  }

  return errors;
}
