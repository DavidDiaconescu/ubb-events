"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInRequired } from "@/components/sign-in-required";
import { RegistrationStatusBadge } from "@/components/status-badges";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { formatEventTime } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { organizationName, venueLabel } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { Registration, UbbEvent } from "@/lib/types";

type TabId = "upcoming" | "past" | "cancelled";

interface RegistrationWithEvent {
  registration: Registration;
  event: UbbEvent;
}

export function MyRegistrations() {
  const state = useAppState();
  const user = useCurrentUser();
  const now = useNow();
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");

  if (user === null) {
    return <SignInRequired message="Sign in to see the events you registered for." />;
  }

  const myRegistrations: RegistrationWithEvent[] = state.registrations
    .filter((registration) => registration.userId === user.id)
    .flatMap((registration) => {
      const event = state.events.find((item) => item.id === registration.eventId);
      return event ? [{ registration, event }] : [];
    });

  const groups: Record<TabId, RegistrationWithEvent[]> = {
    upcoming: myRegistrations
      .filter(({ registration, event }) =>
        ["CONFIRMED", "WAITLISTED"].includes(registration.status) && Date.parse(event.endTime) >= now)
      .sort((a, b) => a.event.startTime.localeCompare(b.event.startTime)),
    past: myRegistrations
      .filter(({ registration, event }) =>
        ["ATTENDED", "ABSENT"].includes(registration.status) ||
        (registration.status === "CONFIRMED" && Date.parse(event.endTime) < now))
      .sort((a, b) => b.event.startTime.localeCompare(a.event.startTime)),
    cancelled: myRegistrations
      .filter(({ registration }) => ["CANCELLED", "CANCELLED_BY_ORGANIZER"].includes(registration.status))
      .sort((a, b) => b.event.startTime.localeCompare(a.event.startTime)),
  };

  const items = groups[activeTab];

  return (
    <div>
      <PageHeader title="My events" description="Your registrations, check-in codes and past participation." />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "upcoming", label: "Upcoming", count: groups.upcoming.length },
          { id: "past", label: "Past", count: groups.past.length },
          { id: "cancelled", label: "Cancelled", count: groups.cancelled.length },
        ]}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          action={activeTab === "upcoming" ? <ButtonLink href="/events" size="sm">Discover events</ButtonLink> : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {items.map(({ registration, event }) => (
            <li key={registration.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/events/${event.id}`} className="font-semibold hover:text-primary">{event.title}</Link>
                  <p className="text-sm text-muted">{organizationName(state, event.organizationId)}</p>
                  <p className="mt-1 text-sm">{formatEventTime(event.startTime, event.endTime)}</p>
                  <p className="text-sm text-muted">{venueLabel(state, event.venueId)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <RegistrationStatusBadge status={registration.status} />
                  {registration.status === "CONFIRMED" && (
                    <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-sm">{registration.checkInCode}</span>
                  )}
                  {registration.status === "WAITLISTED" && (
                    <span className="text-sm text-muted">#{registration.waitlistPosition} on the waitlist</span>
                  )}
                  {registration.lateCancellation && <span className="text-xs text-warning">Late cancellation</span>}
                </div>
              </div>
              {registration.status === "CANCELLED_BY_ORGANIZER" && event.cancellationReason && (
                <p className="mt-3 border-t border-border pt-3 text-sm text-muted">
                  Reason: {event.cancellationReason}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
