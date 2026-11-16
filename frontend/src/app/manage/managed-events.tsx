"use client";

import { LayoutDashboard, Plus } from "lucide-react";
import { AccessDenied, SignInRequired } from "@/components/sign-in-required";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { canManageEvent, hasOrganizerAccess, organizationsUserCanCreateEventsFor } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { EventStatus } from "@/lib/types";
import { ManagedEventTable } from "./managed-event-table";

/** Events grouped by what the organizers need to do next. */
const GROUPS: { title: string; description: string; statuses: EventStatus[] }[] = [
  { title: "In preparation", description: "Drafts and approved events that are not published yet.", statuses: ["DRAFT", "APPROVED"] },
  { title: "Waiting for approval", description: "An administrator has to approve these before they can be published.", statuses: ["PENDING_APPROVAL"] },
  { title: "Live", description: "Published events and events taking place now.", statuses: ["PUBLISHED", "REGISTRATION_CLOSED", "ONGOING"] },
  { title: "Past and cancelled", description: "", statuses: ["FINISHED", "ARCHIVED", "CANCELLED"] },
];

export function ManagedEvents() {
  const state = useAppState();
  const user = useCurrentUser();

  if (user === null) return <SignInRequired />;
  if (!hasOrganizerAccess(state, user)) return <AccessDenied />;

  const managedEvents = state.events.filter((event) => canManageEvent(state, user, event));
  const canCreateEvents = organizationsUserCanCreateEventsFor(state, user).length > 0;

  return (
    <div>
      <PageHeader
        title="Manage events"
        description="Events of your organizations and events you help organize."
        actions={
          canCreateEvents && (
            <ButtonLink href="/manage/events/new">
              <Plus className="size-4" aria-hidden="true" />
              New event
            </ButtonLink>
          )
        }
      />

      {managedEvents.length === 0 ? (
        <EmptyState icon={LayoutDashboard} title="You do not manage any events yet" />
      ) : (
        <div className="space-y-10">
          {GROUPS.map((group) => {
            const events = managedEvents
              .filter((event) => group.statuses.includes(event.status))
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            if (events.length === 0) return null;

            return (
              <section key={group.title}>
                <h2 className="text-base font-semibold">{group.title}</h2>
                {group.description && <p className="mb-3 text-sm text-muted">{group.description}</p>}
                <ManagedEventTable events={events} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
