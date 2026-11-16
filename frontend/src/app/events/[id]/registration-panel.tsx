"use client";

import { CapacityMeter } from "@/components/capacity-meter";
import { FeedbackForm } from "@/components/feedback-form";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { countRegistrations, countTakenPlaces, latestRegistrationOf } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";
import { ActiveRegistration } from "./_registration/active-registration";
import { RegisterAction } from "./_registration/register-action";

/** The right-hand panel of the event page: everything about the current user's participation. */
export function RegistrationPanel({ event }: { event: UbbEvent }) {
  const state = useAppState();

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold">Registration</h2>
      {event.status !== "CANCELLED" && (
        <div className="mb-5">
          <CapacityMeter
            confirmed={countTakenPlaces(state, event.id)}
            capacity={event.capacity}
            waitlisted={countRegistrations(state, event.id, "WAITLISTED")}
          />
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

function AttendedRegistration({ event, userId }: { event: UbbEvent; userId: number }) {
  const state = useAppState();
  const canGiveFeedback = event.status === "FINISHED" || event.status === "ARCHIVED";
  // Anonymous reviews come without an author, so they cannot be matched here; the backend
  // still rejects a second review (BR-24) and the toast explains why.
  const hasGivenFeedback = state.feedback.some((item) => item.eventId === event.id && item.userId === userId);

  return (
    <div className="space-y-4">
      <Notice tone="success" title="You attended this event" />
      {canGiveFeedback && !hasGivenFeedback && <FeedbackForm eventId={event.id} />}
      {hasGivenFeedback && <p className="text-sm text-muted">Thank you, your feedback was recorded.</p>}
    </div>
  );
}
