"use client";

import { CalendarDays } from "lucide-react";
import { EventList } from "@/components/event-list";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useNow } from "@/lib/hooks";
import { describeRole } from "@/lib/permissions";
import { activeRegistrationOf, eventsOpenForRegistration } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { User } from "@/lib/types";
import { NotificationsPreview } from "./notifications-preview";
import { OrganizerSummary } from "./organizer-summary";
import { UpcomingRegistrations } from "./upcoming-registrations";

const MAX_SUGGESTIONS = 3;

/** The home page of a signed-in user. */
export function SignedInDashboard({ user }: { user: User }) {
  const state = useAppState();
  const now = useNow();

  const suggestions = eventsOpenForRegistration(state, now)
    .filter((event) => !activeRegistrationOf(state, event.id, user.id))
    .slice(0, MAX_SUGGESTIONS);

  return (
    <div>
      <PageHeader title={`Hello, ${user.firstName}!`} description={describeRole(state, user)} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <UpcomingRegistrations user={user} />
          <section>
            <h2 className="mb-4 text-base font-semibold">Open for registration</h2>
            <EventList
              events={suggestions}
              empty={<EmptyState icon={CalendarDays} title="No other events are open for registration right now" />}
            />
          </section>
        </div>

        <div className="space-y-6">
          <NotificationsPreview user={user} />
          <OrganizerSummary user={user} />
        </div>
      </div>
    </div>
  );
}
