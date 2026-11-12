"use client";

import { useState } from "react";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Checkbox, Input, Select } from "@/components/ui/form";
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

export function EventBrowser() {
  const state = useAppState();
  const now = useNow();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

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

      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            type="search"
            placeholder="Search by title, topic or organization"
            aria-label="Search events"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            className="lg:col-span-2"
          />
          <Select
            aria-label="Category"
            value={filters.category}
            onChange={(event) => updateFilter("category", event.target.value as EventCategory | "")}
          >
            <option value="">All categories</option>
            {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Select
            aria-label="Organization"
            value={filters.organizationId}
            onChange={(event) => updateFilter("organizationId", event.target.value)}
          >
            <option value="">All organizations</option>
            {state.organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="inline-flex rounded-lg border border-border p-0.5" role="group" aria-label="Time">
            {(["upcoming", "past"] as const).map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={filters.time === time}
                onClick={() => updateFilter("time", time)}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  filters.time === time ? "bg-primary-soft text-primary" : "text-muted hover:text-foreground"
                }`}
              >
                {time === "upcoming" ? "Upcoming" : "Past"}
              </button>
            ))}
          </div>
          <Checkbox
            label="Open for registration"
            checked={filters.openOnly}
            onChange={(event) => updateFilter("openOnly", event.target.checked)}
          />
          <Checkbox
            label="Show cancelled"
            checked={filters.showCancelled}
            onChange={(event) => updateFilter("showCancelled", event.target.checked)}
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)} className="ml-auto">
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">
        {visibleEvents.length} {visibleEvents.length === 1 ? "event" : "events"}
      </p>

      {visibleEvents.length === 0 ? (
        <EmptyState title="No events match your filters" description="Try another category or a broader search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
