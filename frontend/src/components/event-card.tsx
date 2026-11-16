"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EventCardDetails } from "@/components/event-card-details";
import { CategoryBadge } from "@/components/status-badges";
import { formatDayAndMonth } from "@/lib/format";
import { organizationName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

/**
 * Event summary as a horizontal "ticket", meant to be stacked in a single column.
 * At rest it shows only the essentials (date, title, organizer, start hour, category).
 * On hover or keyboard focus it expands with description, place, capacity and status;
 * a click opens the event page with the full details and registration.
 */
export function EventCard({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const { day, month } = formatDayAndMonth(event.startTime);
  const startHour = new Date(event.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const isCancelled = event.status === "CANCELLED";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-primary/30 hover:shadow-xl hover:delay-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* Date stub */}
      <div className={`flex w-16 shrink-0 flex-col items-center justify-center bg-gradient-to-b py-2 text-white sm:w-20 ${
        isCancelled ? "from-slate-500 to-slate-600" : "from-navy-light to-navy"
      }`}>
        <span className="text-2xl font-bold leading-none">{day}</span>
        <span className="mt-0.5 text-[10px] font-semibold tracking-[0.2em]">{month}</span>
      </div>

      {/* Ticket perforation between the stub and the details */}
      <div className="relative w-0 border-l-2 border-dashed border-border" aria-hidden="true">
        <span className="absolute -left-2.5 -top-2.5 size-5 rounded-full border border-border bg-background" />
        <span className="absolute -bottom-2.5 -left-2.5 size-5 rounded-full border border-border bg-background" />
      </div>

      <div className="min-w-0 flex-1 px-4 py-2.5 sm:px-5">
        {/* Always visible: the essentials */}
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold tracking-tight transition-colors group-hover:text-primary group-hover:delay-300">
              {event.title}
            </h3>
            <p className="truncate text-sm text-muted">{organizationName(state, event.organizationId)} · {startHour}</p>
          </div>
          <div className="hidden sm:block">
            <CategoryBadge category={event.category} />
          </div>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:delay-300 group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground"
            aria-hidden="true"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>

        {/* Revealed on hover / focus: grid-rows 0fr → 1fr animates the height smoothly */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-hover:delay-300 group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
          <div className="min-h-0 overflow-hidden">
            <EventCardDetails event={event} />
          </div>
        </div>
      </div>
    </Link>
  );
}
