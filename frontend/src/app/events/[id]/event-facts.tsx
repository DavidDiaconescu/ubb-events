"use client";

import { CalendarDays, Clock, MapPin, Users, type LucideIcon } from "lucide-react";
import { CardSection } from "@/components/ui/card";
import { formatDateTime, formatEventTime } from "@/lib/format";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

/** When, where, the registration period and who can register, followed by the description. */
export function EventFacts({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const venue = state.venues.find((item) => item.id === event.venueId);
  const place = venue ? (venue.online ? venue.name : `${venue.name}, ${venue.address}`) : "Venue to be announced";

  return (
    <CardSection title="Details">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <Fact icon={CalendarDays} label="When" value={formatEventTime(event.startTime, event.endTime)} />
        <Fact icon={MapPin} label="Where" value={place} />
        <Fact
          icon={Clock}
          label="Registration period"
          value={`${formatDateTime(event.registrationOpensAt)} – ${formatDateTime(event.registrationClosesAt)}`}
        />
        <Fact icon={Users} label="Who can register" value={event.visibility === "PUBLIC" ? "Everyone" : "Members of the organization"} />
      </dl>
      <p className="mt-5 whitespace-pre-line border-t border-border pt-5 leading-relaxed">{event.description}</p>
    </CardSection>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
        <dd className="mt-1">{value}</dd>
      </div>
    </div>
  );
}
