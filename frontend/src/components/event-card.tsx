"use client";

import Link from "next/link";
import { CapacityMeter } from "@/components/capacity-meter";
import { CategoryBadge, EventStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { formatDayAndMonth, formatEventTime } from "@/lib/format";
import { countRegistrations, countTakenPlaces, organizationName, venueLabel } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

/** Summary of an event, used in the discovery grid and on organization pages. */
export function EventCard({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const { day, month } = formatDayAndMonth(event.startTime);
  const confirmed = countTakenPlaces(state, event.id);
  const waitlisted = countRegistrations(state, event.id, "WAITLISTED");

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-md hover:shadow-black/5"
    >
      <div className="flex items-start gap-4">
        <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-primary-soft py-1.5 text-primary">
          <span className="text-lg font-semibold leading-tight">{day}</span>
          <span className="text-[11px] font-medium tracking-wide">{month}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug group-hover:text-primary">{event.title}</h3>
          <p className="mt-0.5 truncate text-sm text-muted">{organizationName(state, event.organizationId)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <CategoryBadge category={event.category} />
        <EventStatusBadge status={event.status} />
        {event.visibility === "MEMBERS_ONLY" && <Badge tone="amber">Members only</Badge>}
      </div>

      <dl className="mt-3 space-y-1 text-sm text-muted">
        <div>
          <dt className="sr-only">When</dt>
          <dd>{formatEventTime(event.startTime, event.endTime)}</dd>
        </div>
        <div>
          <dt className="sr-only">Where</dt>
          <dd className="truncate">{venueLabel(state, event.venueId)}</dd>
        </div>
      </dl>

      {event.status !== "CANCELLED" && (
        <div className="mt-auto pt-4">
          <CapacityMeter confirmed={confirmed} capacity={event.capacity} waitlisted={waitlisted} />
        </div>
      )}
    </Link>
  );
}
