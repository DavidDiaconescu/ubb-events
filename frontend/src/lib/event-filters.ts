import { EVENT_CATEGORY_LABELS } from "./labels";
import { isVisibleToParticipants } from "./permissions";
import { isOpenForRegistration, organizationName, sortByStartTime } from "./queries";
import type { AppState, EventCategory, UbbEvent } from "./types";

/** The filters of the "Discover events" page (R6: search and information access). */

export type TimeFilter = "upcoming" | "past";

export interface EventFilters {
  search: string;
  category: EventCategory | "";
  organizationId: string;
  time: TimeFilter;
  openOnly: boolean;
  showCancelled: boolean;
}

export const DEFAULT_FILTERS: EventFilters = {
  search: "",
  category: "",
  organizationId: "",
  time: "upcoming",
  openOnly: false,
  showCancelled: false,
};

export function isEventCategory(value: string | null): value is EventCategory {
  return value !== null && value in EVENT_CATEGORY_LABELS;
}

export function hasActiveFilters(filters: EventFilters): boolean {
  return (Object.keys(DEFAULT_FILTERS) as (keyof EventFilters)[]).some((key) => filters[key] !== DEFAULT_FILTERS[key]);
}

export function matchesFilters(state: AppState, event: UbbEvent, filters: EventFilters, now: number): boolean {
  if (!isVisibleToParticipants(event) || event.status === "ARCHIVED") return false;

  const hasEnded = Date.parse(event.endTime) < now;
  if (filters.time === "upcoming" && hasEnded) return false;
  if (filters.time === "past" && !hasEnded) return false;

  if (event.status === "CANCELLED" && !filters.showCancelled) return false;
  if (filters.category && event.category !== filters.category) return false;
  if (filters.organizationId && event.organizationId !== Number(filters.organizationId)) return false;
  if (filters.openOnly && !isOpenForRegistration(event, now)) return false;

  const query = filters.search.trim().toLowerCase();
  if (query) {
    const searchableText = `${event.title} ${event.description} ${organizationName(state, event.organizationId)}`;
    if (!searchableText.toLowerCase().includes(query)) return false;
  }
  return true;
}

/** Upcoming events soonest first; past events are more useful newest first. */
export function filterEvents(state: AppState, filters: EventFilters, now: number): UbbEvent[] {
  const sorted = sortByStartTime(state.events.filter((event) => matchesFilters(state, event, filters, now)));
  return filters.time === "past" ? sorted.reverse() : sorted;
}
