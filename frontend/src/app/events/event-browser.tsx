"use client";

import { Building2, ChevronDown, RotateCcw, Search, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import { CATEGORIES, CATEGORY_ICONS } from "@/components/category-icons";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useNow } from "@/lib/hooks";
import { EVENT_CATEGORY_LABELS } from "@/lib/labels";
import { isVisibleToParticipants } from "@/lib/permissions";
import { organizationName, sortByStartTime } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { EventCategory, UbbEvent } from "@/lib/types";

type TimeFilter = "upcoming" | "past";

interface Filters {
  search: string;
  category: EventCategory | "";
  organizationId: string;
  time: TimeFilter;
  openOnly: boolean;
  showCancelled: boolean;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "",
  organizationId: "",
  time: "upcoming",
  openOnly: false,
  showCancelled: false,
};

function isEventCategory(value: string | null): value is EventCategory {
  return value !== null && value in EVENT_CATEGORY_LABELS;
}

export function EventBrowser() {
  const state = useAppState();
  const now = useNow();
  // `?category=WORKSHOP` (used by the category shortcuts on the home page) preselects that category.
  const categoryParam = useSearchParams().get("category");
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    category: isEventCategory(categoryParam) ? categoryParam : "",
  }));

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function matchesFilters(event: UbbEvent): boolean {
    if (!isVisibleToParticipants(event) || event.status === "ARCHIVED") return false;

    const hasEnded = Date.parse(event.endTime) < now;
    if (filters.time === "upcoming" && hasEnded) return false;
    if (filters.time === "past" && !hasEnded) return false;

    if (event.status === "CANCELLED" && !filters.showCancelled) return false;
    if (filters.category && event.category !== filters.category) return false;
    if (filters.organizationId && event.organizationId !== Number(filters.organizationId)) return false;

    if (filters.openOnly) {
      const isOpen =
        event.status === "PUBLISHED" &&
        Date.parse(event.registrationOpensAt) <= now &&
        now < Date.parse(event.registrationClosesAt);
      if (!isOpen) return false;
    }

    const query = filters.search.trim().toLowerCase();
    if (query) {
      const searchableText = `${event.title} ${event.description} ${organizationName(state, event.organizationId)}`;
      if (!searchableText.toLowerCase().includes(query)) return false;
    }
    return true;
  }

  const sortedEvents = sortByStartTime(state.events.filter(matchesFilters));
  // Past events are more useful newest first.
  const visibleEvents = filters.time === "past" ? sortedEvents.reverse() : sortedEvents;
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div>
      <PageHeader
        title="Discover events"
        description="Find workshops, conferences, trainings and more organized by UBB student organizations."
      />

      <div className="mb-8 rounded-3xl bg-gradient-to-br from-navy to-navy-light p-5 text-white shadow-lg sm:p-7">
        {/* Search */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by title, topic or organization"
            aria-label="Search events"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            className="h-13 w-full rounded-2xl bg-white pl-12 pr-4 text-base text-foreground shadow-md placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-white/30"
          />
        </div>

        {/* Categories as chips */}
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Category">
          <FilterChip active={filters.category === ""} onClick={() => updateFilter("category", "")}>
            All
          </FilterChip>
          {CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <FilterChip
                key={category}
                active={filters.category === category}
                onClick={() => updateFilter("category", filters.category === category ? "" : category)}
              >
                <Icon className="size-4" aria-hidden="true" />
                {EVENT_CATEGORY_LABELS[category]}
              </FilterChip>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-white/15 pt-5 lg:flex-row lg:items-center">
          {/* Upcoming / past */}
          <div className="inline-flex self-start rounded-xl bg-white/10 p-1" role="group" aria-label="Time">
            {(["upcoming", "past"] as const).map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={filters.time === time}
                onClick={() => updateFilter("time", time)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white ${
                  filters.time === time ? "bg-white text-navy shadow-sm" : "text-white/75 hover:text-white"
                }`}
              >
                {time === "upcoming" ? "Upcoming" : "Past"}
              </button>
            ))}
          </div>

          {/* Organization */}
          <label className="relative block lg:w-60">
            <span className="sr-only">Organization</span>
            <Building2
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/70"
              aria-hidden="true"
            />
            <select
              value={filters.organizationId}
              onChange={(event) => updateFilter("organizationId", event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-white/20 bg-white/10 pl-9 pr-9 text-sm text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="" className="text-foreground">All organizations</option>
              {state.organizations.map((organization) => (
                <option key={organization.id} value={organization.id} className="text-foreground">
                  {organization.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/70"
              aria-hidden="true"
            />
          </label>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:ml-2">
            <Toggle
              label="Open for registration"
              checked={filters.openOnly}
              onChange={(checked) => updateFilter("openOnly", checked)}
            />
            <Toggle
              label="Show cancelled"
              checked={filters.showCancelled}
              onChange={(checked) => updateFilter("showCancelled", checked)}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white lg:ml-auto lg:self-auto"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
        <span className="font-semibold text-foreground">{visibleEvents.length}</span>{" "}
        {visibleEvents.length === 1 ? "event" : "events"} found
      </p>

      {visibleEvents.length === 0 ? (
        <EmptyState icon={SearchX} title="No events match your filters" description="Try another category or a broader search." />
      ) : (
        <div className="flex flex-col gap-4">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Pill-shaped toggle button used for the category filter on the navy panel. */
function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        active
          ? "bg-white text-navy shadow-md"
          : "bg-white/10 text-white/85 ring-1 ring-white/15 hover:bg-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/** On/off switch with its label, styled for the navy panel. */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2.5 rounded-lg text-sm font-medium text-white/85 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-white" : "bg-white/20 group-hover:bg-white/30"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 size-4 rounded-full shadow transition-all duration-200 ${
            checked ? "left-6 bg-navy" : "left-1 bg-white"
          }`}
        />
      </span>
      {label}
    </button>
  );
}
