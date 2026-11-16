"use client";

import { RotateCcw, Search } from "lucide-react";
import { CATEGORIES, CATEGORY_ICONS } from "@/components/category-icons";
import { FilterChip, SegmentedControl } from "@/components/ui/filter-chip";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { DEFAULT_FILTERS, hasActiveFilters, type EventFilters, type TimeFilter } from "@/lib/event-filters";
import { EVENT_CATEGORY_LABELS } from "@/lib/labels";
import type { Organization } from "@/lib/types";
import { OrganizationSelect } from "./organization-select";

interface EventFilterPanelProps {
  filters: EventFilters;
  organizations: Organization[];
  onChange: (filters: EventFilters) => void;
}

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

/** Search box, category chips and the other filters, on a navy panel. */
export function EventFilterPanel({ filters, organizations, onChange }: EventFilterPanelProps) {
  function update<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-br from-navy to-navy-light p-5 text-white shadow-lg sm:p-7">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search by title, topic or organization"
          aria-label="Search events"
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          className="h-13 w-full rounded-2xl bg-white pl-12 pr-4 text-base text-foreground shadow-md placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-white/30"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Category">
        <FilterChip active={filters.category === ""} onClick={() => update("category", "")}>All</FilterChip>
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <FilterChip
              key={category}
              active={filters.category === category}
              onClick={() => update("category", filters.category === category ? "" : category)}
            >
              <Icon className="size-4" aria-hidden="true" />
              {EVENT_CATEGORY_LABELS[category]}
            </FilterChip>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-white/15 pt-5 lg:flex-row lg:items-center">
        <SegmentedControl label="Time" options={TIME_OPTIONS} value={filters.time} onChange={(time) => update("time", time)} />

        <OrganizationSelect
          organizations={organizations}
          value={filters.organizationId}
          onChange={(organizationId) => update("organizationId", organizationId)}
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:ml-2">
          <ToggleSwitch label="Open for registration" checked={filters.openOnly} onChange={(checked) => update("openOnly", checked)} />
          <ToggleSwitch label="Show cancelled" checked={filters.showCancelled} onChange={(checked) => update("showCancelled", checked)} />
        </div>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white lg:ml-auto lg:self-auto"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
