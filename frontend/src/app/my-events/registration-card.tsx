"use client";

import { Clock, Hourglass, MapPin } from "lucide-react";
import Link from "next/link";
import { CheckInCode } from "@/components/check-in-code";
import { RegistrationStatusBadge } from "@/components/status-badges";
import { CARD_CLASSES } from "@/components/ui/card";
import { IconLabel } from "@/components/ui/icon-label";
import { formatEventTime } from "@/lib/format";
import { organizationName, venueLabel } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { RegistrationWithEvent } from "./my-registrations";

/** One of the user's registrations: the event, its status and the check-in code or waitlist position. */
export function RegistrationCard({ registration, event }: RegistrationWithEvent) {
  const state = useAppState();

  return (
    <li className={`p-5 ${CARD_CLASSES}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <Link href={`/events/${event.id}`} className="font-semibold hover:text-primary">{event.title}</Link>
          <span className="text-sm text-muted">{organizationName(state, event.organizationId)}</span>
          <IconLabel icon={Clock} className="mt-1 text-sm">{formatEventTime(event.startTime, event.endTime)}</IconLabel>
          <IconLabel icon={MapPin} className="text-sm text-muted">{venueLabel(state, event.venueId)}</IconLabel>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RegistrationStatusBadge status={registration.status} />
          {registration.status === "CONFIRMED" && <CheckInCode code={registration.checkInCode} compact />}
          {registration.status === "WAITLISTED" && (
            <IconLabel icon={Hourglass} className="text-sm text-muted">#{registration.waitlistPosition} on the waitlist</IconLabel>
          )}
          {registration.lateCancellation && <span className="text-xs text-warning">Late cancellation</span>}
        </div>
      </div>
      {registration.status === "CANCELLED_BY_ORGANIZER" && event.cancellationReason && (
        <p className="mt-3 border-t border-border pt-3 text-sm text-muted">Reason: {event.cancellationReason}</p>
      )}
    </li>
  );
}
