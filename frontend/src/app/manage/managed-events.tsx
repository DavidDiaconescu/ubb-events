"use client";

import { LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { AccessDenied, SignInRequired } from "@/components/sign-in-required";
import { EventStatusBadge } from "@/components/status-badges";
import { ButtonLink } from "@/components/ui/button";
import { CARD_CLASSES } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/format";
import { canManageEvent, hasOrganizerAccess, organizationsUserCanCreateEventsFor } from "@/lib/permissions";
import { countRegistrations, countTakenPlaces, organizationName } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { EventStatus, UbbEvent } from "@/lib/types";

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

function ManagedEventTable({ events }: { events: UbbEvent[] }) {
  const state = useAppState();

  return (
    <div className={`mt-3 overflow-x-auto ${CARD_CLASSES}`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Event</th>
            <th scope="col" className="px-4 py-3 font-medium">Starts</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Places</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Waitlist</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((event) => (
            <tr key={event.id} className="transition-colors hover:bg-surface-muted">
              <td className="px-4 py-3">
                <Link href={`/manage/events/${event.id}`} className="font-medium hover:text-primary">{event.title}</Link>
                <p className="text-xs text-muted">{organizationName(state, event.organizationId)}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDateTime(event.startTime)}</td>
              <td className="px-4 py-3"><EventStatusBadge status={event.status} /></td>
              <td className="px-4 py-3 text-right tabular-nums">{countTakenPlaces(state, event.id)} / {event.capacity}</td>
              <td className="px-4 py-3 text-right tabular-nums">{countRegistrations(state, event.id, "WAITLISTED")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
