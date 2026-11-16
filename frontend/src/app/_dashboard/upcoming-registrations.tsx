"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { RegistrationStatusBadge } from "@/components/status-badges";
import { ButtonLink } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatEventTime } from "@/lib/format";
import { findEventById } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { User } from "@/lib/types";

/** The user's confirmed and waitlisted registrations, soonest first. */
export function UpcomingRegistrations({ user }: { user: User }) {
  const state = useAppState();

  const items = state.registrations
    .filter((registration) =>
      registration.userId === user.id && (registration.status === "CONFIRMED" || registration.status === "WAITLISTED"))
    .flatMap((registration) => {
      const event = findEventById(state, registration.eventId);
      return event ? [{ registration, event }] : [];
    })
    .sort((a, b) => a.event.startTime.localeCompare(b.event.startTime));

  return (
    <CardSection title="Your upcoming events" action={<Link href="/my-events" className="text-sm font-medium text-primary">See all</Link>}>
      {items.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="You are not registered for any event yet"
          action={<ButtonLink href="/events" size="sm">Discover events</ButtonLink>}
        />
      ) : (
        <ul className="-mx-2 divide-y divide-border">
          {items.map(({ registration, event }) => (
            <li key={registration.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-surface-muted">
              <div className="min-w-0">
                <Link href={`/events/${event.id}`} className="font-medium hover:text-primary">{event.title}</Link>
                <p className="text-sm text-muted">{formatEventTime(event.startTime, event.endTime)}</p>
              </div>
              <div className="flex items-center gap-2">
                {registration.status === "WAITLISTED" && (
                  <span className="text-xs text-muted">#{registration.waitlistPosition} in line</span>
                )}
                <RegistrationStatusBadge status={registration.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardSection>
  );
}
