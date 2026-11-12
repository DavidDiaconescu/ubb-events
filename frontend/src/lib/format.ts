import type { IsoDateTime } from "./types";

/**
 * Date helpers. They run only in the browser (pages render after hydration),
 * so dates are shown in the user's own time zone.
 */

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

const dayMonthFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export function formatDateTime(value: IsoDateTime): string {
  return dateTimeFormat.format(new Date(value));
}

export function formatDate(value: IsoDateTime): string {
  return dateFormat.format(new Date(value));
}

/** For `LocalDate` values such as "2026-11-18" (no time zone conversion). */
export function formatCalendarDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return dayMonthFormat.format(new Date(year, month - 1, day));
}

/** "Fri, 20 Nov 2026 · 18:00 – 21:00", or both full dates for multi-day events. */
export function formatEventTime(start: IsoDateTime, end: IsoDateTime): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${dateFormat.format(startDate)} · ${timeFormat.format(startDate)} – ${timeFormat.format(endDate)}`;
  }
  return `${dateTimeFormat.format(startDate)} – ${dateTimeFormat.format(endDate)}`;
}

/** Short day and month for calendar-style badges. */
export function formatDayAndMonth(value: IsoDateTime): { day: string; month: string } {
  const date = new Date(value);
  return {
    day: String(date.getDate()),
    month: date.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
  };
}

/** Converts an ISO date to the value format of `<input type="datetime-local">` (local time). */
export function toDateTimeInputValue(value: IsoDateTime): string {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Converts a `datetime-local` value (local time) back to an ISO date; empty input gives "". */
export function fromDateTimeInputValue(value: string): IsoDateTime {
  if (value === "") return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function fullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}

export function initials(user: { firstName: string; lastName: string }): string {
  return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
}
