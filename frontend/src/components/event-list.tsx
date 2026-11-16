import type { ReactNode } from "react";
import { EventCard } from "@/components/event-card";
import type { UbbEvent } from "@/lib/types";

/** A column of event cards, or `empty` when there are none. */
export function EventList({ events, empty = null }: { events: UbbEvent[]; empty?: ReactNode }) {
  if (events.length === 0) return <>{empty}</>;

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
