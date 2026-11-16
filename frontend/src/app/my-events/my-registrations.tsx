"use client";

import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { SignInRequired } from "@/components/sign-in-required";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useNow } from "@/lib/hooks";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { AppState, Registration, UbbEvent } from "@/lib/types";
import { RegistrationCard } from "./registration-card";

type TabId = "upcoming" | "past" | "cancelled";

export interface RegistrationWithEvent {
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

  const groups = groupRegistrations(state, user.id, now);
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
          icon={CalendarCheck}
          title="Nothing here yet"
          action={activeTab === "upcoming" ? <ButtonLink href="/events" size="sm">Discover events</ButtonLink> : undefined}
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => <RegistrationCard key={item.registration.id} {...item} />)}
        </ul>
      )}
    </div>
  );
}

/** Upcoming soonest first; past and cancelled newest first. */
function groupRegistrations(state: AppState, userId: number, now: number): Record<TabId, RegistrationWithEvent[]> {
  const mine: RegistrationWithEvent[] = state.registrations
    .filter((registration) => registration.userId === userId)
    .flatMap((registration) => {
      const event = state.events.find((item) => item.id === registration.eventId);
      return event ? [{ registration, event }] : [];
    });
  const hasEnded = ({ event }: RegistrationWithEvent) => Date.parse(event.endTime) < now;
  const soonestFirst = (a: RegistrationWithEvent, b: RegistrationWithEvent) => a.event.startTime.localeCompare(b.event.startTime);
  const newestFirst = (a: RegistrationWithEvent, b: RegistrationWithEvent) => -soonestFirst(a, b);

  return {
    upcoming: mine
      .filter((item) => ["CONFIRMED", "WAITLISTED"].includes(item.registration.status) && !hasEnded(item))
      .sort(soonestFirst),
    past: mine
      .filter((item) => ["ATTENDED", "ABSENT"].includes(item.registration.status) || (item.registration.status === "CONFIRMED" && hasEnded(item)))
      .sort(newestFirst),
    cancelled: mine
      .filter((item) => ["CANCELLED", "CANCELLED_BY_ORGANIZER"].includes(item.registration.status))
      .sort(newestFirst),
  };
}
