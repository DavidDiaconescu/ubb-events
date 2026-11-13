"use client";

import { ArrowRight, CalendarCheck, Hourglass, QrCode } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CapacityMeter } from "@/components/capacity-meter";
import { FeedbackForm } from "@/components/feedback-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { formatDateTime } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { cancelRegistration, registerForEvent } from "@/lib/mock-api";
import { isActiveMember } from "@/lib/permissions";
import { countRegistrations, countTakenPlaces, latestRegistrationOf, organizationName } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { Registration, UbbEvent } from "@/lib/types";

const LATE_CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

/** The right-hand panel of the event page: everything about the current user's participation. */
export function RegistrationPanel({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const takenPlaces = countTakenPlaces(state, event.id);
  const waitlisted = countRegistrations(state, event.id, "WAITLISTED");

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold">Registration</h2>
      {event.status !== "CANCELLED" && (
        <div className="mb-5">
          <CapacityMeter confirmed={takenPlaces} capacity={event.capacity} waitlisted={waitlisted} />
        </div>
      )}
      <PanelContent event={event} />
    </Card>
  );
}

function PanelContent({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const user = useCurrentUser();

  if (event.status === "CANCELLED") {
    return <p className="text-sm text-muted">This event was cancelled, so registration is not possible.</p>;
  }
  if (user === null) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">Sign in to register for this event.</p>
        <ButtonLink href="/login" className="w-full">Sign in</ButtonLink>
      </div>
    );
  }

  const registration = latestRegistrationOf(state, event.id, user.id);
  switch (registration?.status) {
    case "CONFIRMED":
    case "WAITLISTED":
      return <ActiveRegistration event={event} registration={registration} />;
    case "ATTENDED":
      return <AttendedRegistration event={event} userId={user.id} />;
    case "ABSENT":
      return <p className="text-sm text-muted">You were registered but did not check in at this event.</p>;
    default:
      return <RegisterAction event={event} userId={user.id} />;
  }
}

function ActiveRegistration({ event, registration }: { event: UbbEvent; registration: Registration }) {
  const now = useNow();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const startTime = Date.parse(event.startTime);
  const canCancel = now < startTime;
  const isLateCancellation = now > startTime - LATE_CANCELLATION_WINDOW_MS;
  const isConfirmed = registration.status === "CONFIRMED";

  function handleCancel() {
    runAction(() => cancelRegistration(registration.id), "Your registration was cancelled.");
    setIsConfirmingCancel(false);
  }

  return (
    <div className="space-y-4">
      {isConfirmed ? (
        <>
          <Notice tone="success" title="You are registered!">
            Show this code to the organizers at the entrance.
          </Notice>
          <div className="rounded-lg border border-dashed border-border bg-surface-muted py-4 text-center">
            <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted">
              <QrCode className="size-4" aria-hidden="true" />
              Check-in code
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-wider">{registration.checkInCode}</p>
          </div>
        </>
      ) : (
        <Notice tone="warning" title={`You are number ${registration.waitlistPosition} on the waitlist`}>
          If a place becomes available you will be confirmed automatically and notified.
        </Notice>
      )}

      {canCancel && !isConfirmingCancel && (
        <Button variant="secondary" className="w-full" onClick={() => setIsConfirmingCancel(true)}>
          {isConfirmed ? "Cancel my registration" : "Leave the waitlist"}
        </Button>
      )}

      {isConfirmingCancel && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-sm">
            Are you sure?
            {isConfirmed && isLateCancellation &&
              " The event starts in less than 24 hours, so this will be recorded as a late cancellation."}
          </p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleCancel}>Yes, cancel</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmingCancel(false)}>Keep it</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendedRegistration({ event, userId }: { event: UbbEvent; userId: number }) {
  const state = useAppState();
  const canGiveFeedback = event.status === "FINISHED" || event.status === "ARCHIVED";
  const hasGivenFeedback = state.feedback.some((item) => item.eventId === event.id && item.userId === userId);

  return (
    <div className="space-y-4">
      <Notice tone="success" title="You attended this event" />
      {canGiveFeedback && !hasGivenFeedback && <FeedbackForm eventId={event.id} />}
      {hasGivenFeedback && <p className="text-sm text-muted">Thank you, your feedback was recorded.</p>}
    </div>
  );
}

/**
 * Explains why the user cannot register, or offers the register / join-waitlist button.
 * The checks mirror RegistrationService.register in the backend.
 */
function RegisterAction({ event, userId }: { event: UbbEvent; userId: number }) {
  const state = useAppState();
  const now = useNow();

  const opensAt = Date.parse(event.registrationOpensAt);
  const closesAt = Date.parse(event.registrationClosesAt);

  if (event.status === "FINISHED" || event.status === "ARCHIVED") {
    return <p className="text-sm text-muted">This event has ended.</p>;
  }
  if (event.status === "ONGOING") {
    return <p className="text-sm text-muted">This event is happening now. Registration is closed.</p>;
  }
  if (event.status === "REGISTRATION_CLOSED" || (event.status === "PUBLISHED" && now >= closesAt)) {
    return <p className="text-sm text-muted">Registration closed on {formatDateTime(event.registrationClosesAt)}.</p>;
  }
  if (event.status !== "PUBLISHED") {
    return <p className="text-sm text-muted">This event has not been published yet.</p>;
  }
  if (now < opensAt) {
    return <p className="text-sm text-muted">Registration opens on {formatDateTime(event.registrationOpensAt)}.</p>;
  }
  if (event.visibility === "MEMBERS_ONLY" && !isActiveMember(state, userId, event.organizationId)) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted">
          Only members of {organizationName(state, event.organizationId)} can register for this event.
        </p>
        <Link
          href={`/organizations/${event.organizationId}`}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          View the organization
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const isFull = countTakenPlaces(state, event.id) >= event.capacity;

  function handleRegister() {
    runAction(
      () => registerForEvent(event.id),
      isFull ? "You joined the waitlist." : "You are registered! Your check-in code is ready.",
    );
  }

  return (
    <div className="space-y-3">
      {isFull && (
        <p className="text-sm text-muted">
          The event is full. Join the waitlist and you will be confirmed automatically if a place becomes available.
        </p>
      )}
      <Button className="w-full" onClick={handleRegister}>
        {isFull ? <Hourglass className="size-4" aria-hidden="true" /> : <CalendarCheck className="size-4" aria-hidden="true" />}
        {isFull ? "Join the waitlist" : "Register"}
      </Button>
      <p className="text-center text-xs text-muted">Registration closes {formatDateTime(event.registrationClosesAt)}</p>
    </div>
  );
}
