"use client";

import { Pencil } from "lucide-react";
import { EventStatusBadge } from "@/components/status-badges";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EDITABLE_STATUSES } from "@/lib/event-lifecycle";
import { formatEventTime } from "@/lib/format";
import { organizationName, venueLabel } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

/** Title, status, organizer, time and place of the managed event, with links to its public page and editor. */
export function ManageEventHeader({ event }: { event: UbbEvent }) {
  const state = useAppState();

  return (
    <PageHeader
      backLink={{ href: "/manage", label: "Manage events" }}
      title={event.title}
      description={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <EventStatusBadge status={event.status} />
          <span>{organizationName(state, event.organizationId)}</span>
          <span>{formatEventTime(event.startTime, event.endTime)}</span>
          <span>{venueLabel(state, event.venueId)}</span>
        </span>
      }
      actions={
        <>
          <ButtonLink href={`/events/${event.id}`} variant="secondary" size="sm">View public page</ButtonLink>
          {EDITABLE_STATUSES.includes(event.status) && (
            <ButtonLink href={`/manage/events/${event.id}/edit`} size="sm">
              <Pencil className="size-4" aria-hidden="true" />
              Edit details
            </ButtonLink>
          )}
        </>
      }
    />
  );
}
