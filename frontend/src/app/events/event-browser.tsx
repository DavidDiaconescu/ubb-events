"use client";

import { SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EventList } from "@/components/event-list";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { DEFAULT_FILTERS, filterEvents, isEventCategory, type EventFilters } from "@/lib/event-filters";
import { useNow } from "@/lib/hooks";
import { useAppState } from "@/lib/store";
import { EventFilterPanel } from "./event-filter-panel";

export function EventBrowser() {
  const state = useAppState();
  const now = useNow();
  // `?category=WORKSHOP` (used by the category shortcuts on the home page) preselects that category.
  const categoryParam = useSearchParams().get("category");
  const [filters, setFilters] = useState<EventFilters>(() => ({
    ...DEFAULT_FILTERS,
    category: isEventCategory(categoryParam) ? categoryParam : "",
  }));

  const visibleEvents = filterEvents(state, filters, now);

  return (
    <div>
      <PageHeader
        title="Discover events"
        description="Find workshops, conferences, trainings and more organized by UBB student organizations."
      />
      <EventFilterPanel filters={filters} organizations={state.organizations} onChange={setFilters} />

      <p className="mb-4 text-sm text-muted">
        <span className="font-semibold text-foreground">{visibleEvents.length}</span>{" "}
        {visibleEvents.length === 1 ? "event" : "events"} found
      </p>

      <EventList
        events={visibleEvents}
        empty={<EmptyState icon={SearchX} title="No events match your filters" description="Try another category or a broader search." />}
      />
    </div>
  );
}
