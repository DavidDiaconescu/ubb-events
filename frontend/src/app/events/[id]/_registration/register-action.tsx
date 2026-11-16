"use client";

import { ArrowRight, CalendarCheck, Hourglass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { registerForEvent } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { isActiveMember } from "@/lib/permissions";
import { countTakenPlaces, organizationName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { UbbEvent } from "@/lib/types";

/**
 * Explains why the user cannot register, or offers the register / join-waitlist button.
 * The checks mirror RegistrationService.register in the backend.
 */
export function RegisterAction({ event, userId }: { event: UbbEvent; userId: number }) {
  const state = useAppState();
  const now = useNow();

  const unavailableReason = registrationUnavailableReason(event, now);
  if (unavailableReason) {
    return <p className="text-sm text-muted">{unavailableReason}</p>;
  }
  if (event.visibility === "MEMBERS_ONLY" && !isActiveMember(state, userId, event.organizationId)) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted">Only members of {organizationName(state, event.organizationId)} can register for this event.</p>
        <Link href={`/organizations/${event.organizationId}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          View the organization
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const isFull = countTakenPlaces(state, event.id) >= event.capacity;
  const Icon = isFull ? Hourglass : CalendarCheck;

  return (
    <div className="space-y-3">
      {isFull && (
        <p className="text-sm text-muted">
          The event is full. Join the waitlist and you will be confirmed automatically if a place becomes available.
        </p>
      )}
      <Button
        className="w-full"
        onClick={() => runAction(
          () => registerForEvent(event.id),
          isFull ? "You joined the waitlist." : "You are registered! Your check-in code is ready.",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
        {isFull ? "Join the waitlist" : "Register"}
      </Button>
      <p className="text-center text-xs text-muted">Registration closes {formatDateTime(event.registrationClosesAt)}</p>
    </div>
  );
}

/** Why registration is not possible at time `now`, or null when it is open. */
function registrationUnavailableReason(event: UbbEvent, now: number): string | null {
  if (event.status === "FINISHED" || event.status === "ARCHIVED") return "This event has ended.";
  if (event.status === "ONGOING") return "This event is happening now. Registration is closed.";
  if (event.status === "REGISTRATION_CLOSED" || (event.status === "PUBLISHED" && now >= Date.parse(event.registrationClosesAt))) {
    return `Registration closed on ${formatDateTime(event.registrationClosesAt)}.`;
  }
  if (event.status !== "PUBLISHED") return "This event has not been published yet.";
  if (now < Date.parse(event.registrationOpensAt)) {
    return `Registration opens on ${formatDateTime(event.registrationOpensAt)}.`;
  }
  return null;
}
