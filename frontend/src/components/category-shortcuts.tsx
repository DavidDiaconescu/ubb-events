"use client";

import Link from "next/link";
import { CATEGORIES, CATEGORY_ICONS } from "@/components/category-icons";
import { useNow } from "@/lib/hooks";
import { EVENT_CATEGORY_LABELS } from "@/lib/labels";
import { isVisibleToParticipants } from "@/lib/permissions";
import { useAppState } from "@/lib/store";
import type { EventCategory } from "@/lib/types";

/** One tile per category with its number of upcoming events; links to /events filtered by that category. */
export function CategoryShortcuts() {
  const state = useAppState();
  const now = useNow();

  const upcomingCount = (category: EventCategory) =>
    state.events.filter(
      (event) =>
        event.category === category &&
        isVisibleToParticipants(event) &&
        event.status !== "CANCELLED" &&
        event.status !== "ARCHIVED" &&
        Date.parse(event.endTime) >= now,
    ).length;

  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="mb-4 text-lg font-semibold">
        Browse by category
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const count = upcomingCount(category);
          return (
            <Link
              key={category}
              href={`/events?category=${category}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/20 hover:bg-navy hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary transition-colors group-hover:bg-white/15 group-hover:text-white">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="font-semibold transition-colors group-hover:text-white">
                {EVENT_CATEGORY_LABELS[category]}
              </span>
              <span className="text-xs text-muted transition-colors group-hover:text-white/70">
                {count} upcoming
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
