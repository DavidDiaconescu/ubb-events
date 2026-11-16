"use client";

import Link from "next/link";
import { EventStatusBadge } from "@/components/status-badges";
import { CARD_CLASSES } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { countRegistrations, countTakenPlaces, organizationName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

const COLUMNS = [
  { label: "Event" }, { label: "Starts" }, { label: "Status" },
  { label: "Places", align: "right" as const }, { label: "Waitlist", align: "right" as const },
];

/** One group of managed events with their status and how full they are. */
export function ManagedEventTable({ events }: { events: UbbEvent[] }) {
  const state = useAppState();

  return (
    <div className={`mt-3 overflow-x-auto ${CARD_CLASSES}`}>
      <Table columns={COLUMNS} cellPadding="px-4 py-3" headerBorder="bottom">
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
      </Table>
    </div>
  );
}
