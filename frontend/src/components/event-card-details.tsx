"use client";

import { ArrowRight, Clock, MapPin } from "lucide-react";
import { CapacityMeter } from "@/components/capacity-meter";
import { CategoryBadge, EventStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { IconLabel } from "@/components/ui/icon-label";
import { formatEventTime } from "@/lib/format";
import { countRegistrations, countTakenPlaces, venueLabel } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

/** The part of an event card revealed on hover or focus: description, time, place, status and capacity. */
export function EventCardDetails({ event }: { event: UbbEvent }) {
  const state = useAppState();

  return (
    <div className="mt-3 border-t border-border pt-3 pb-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-300 group-focus-visible:opacity-100">
      <p className="line-clamp-2 text-sm text-foreground/80">{event.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted">
        <IconLabel icon={Clock}>{formatEventTime(event.startTime, event.endTime)}</IconLabel>
        <IconLabel icon={MapPin}>{venueLabel(state, event.venueId)}</IconLabel>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="sm:hidden">
          <CategoryBadge category={event.category} />
        </span>
        <EventStatusBadge status={event.status} />
        {event.visibility === "MEMBERS_ONLY" && <Badge tone="amber">Members only</Badge>}
      </div>

      {event.status !== "CANCELLED" && (
        <div className="mt-4 max-w-sm">
          <CapacityMeter
            confirmed={countTakenPlaces(state, event.id)}
            capacity={event.capacity}
            waitlisted={countRegistrations(state, event.id, "WAITLISTED")}
          />
        </div>
      )}

      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Click for full details and registration
        <ArrowRight className="size-4" aria-hidden="true" />
      </p>
    </div>
  );
}
