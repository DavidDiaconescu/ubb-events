"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { CARD_CLASSES } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { changeEventStatus } from "@/lib/actions";
import { formatEventTime } from "@/lib/format";
import { organizationName, userDisplayName, venueLabel } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { UbbEvent } from "@/lib/types";

/** Events waiting for an administrator's decision (approve, or send back to draft). */
export function ApprovalQueue({ events }: { events: UbbEvent[] }) {
  const state = useAppState();

  if (events.length === 0) {
    return <EmptyState icon={CircleCheck} title="No events are waiting for approval" />;
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className={`p-5 ${CARD_CLASSES}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/manage/events/${event.id}`} className="font-semibold hover:text-primary">{event.title}</Link>
                <CategoryBadge category={event.category} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {organizationName(state, event.organizationId)} · created by {userDisplayName(state, event.createdById)}
              </p>
              <p className="mt-1 text-sm">
                {formatEventTime(event.startTime, event.endTime)} · {venueLabel(state, event.venueId)} · {event.capacity} places
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-muted">{event.description}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => runAction(() => changeEventStatus(event.id, "APPROVED"), "The event was approved.")}>
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => runAction(() => changeEventStatus(event.id, "DRAFT"), "The event was sent back to draft.")}
              >
                Reject
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
