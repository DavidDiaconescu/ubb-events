"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form";
import { ALLOWED_TRANSITIONS, LIFECYCLE_STEPS, requiresAdmin, transitionLabel } from "@/lib/event-lifecycle";
import { EVENT_STATUS_LABELS } from "@/lib/labels";
import { changeEventStatus } from "@/lib/mock-api";
import { isAdmin } from "@/lib/permissions";
import { useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { EventStatus, UbbEvent } from "@/lib/types";

const NEXT_STEP_HINTS: Record<EventStatus, string> = {
  DRAFT: "Complete the details, then submit the event for approval.",
  PENDING_APPROVAL: "An administrator is reviewing the event.",
  APPROVED: "The event was approved. Publish it to open registration.",
  PUBLISHED: "Participants can register until the registration deadline.",
  REGISTRATION_CLOSED: "Registration is closed. Start the event when it begins.",
  ONGOING: "Check participants in. When you mark the event as finished, participants who did not check in are marked absent.",
  FINISHED: "Participants who attended can now leave feedback. Archive the event when you are done.",
  ARCHIVED: "This event is archived. No further changes are possible.",
  CANCELLED: "This event was cancelled.",
};

/** Shows where the event is in its lifecycle and the status changes the user can make. */
export function LifecyclePanel({ event }: { event: UbbEvent }) {
  const user = useCurrentUser();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const availableTransitions = ALLOWED_TRANSITIONS[event.status].filter(
    (target) => !requiresAdmin(event.status, target) || isAdmin(user),
  );
  const nextSteps = availableTransitions.filter((target) => target !== "CANCELLED");
  const canCancel = availableTransitions.includes("CANCELLED");

  const hint = event.status === "PENDING_APPROVAL" && isAdmin(user)
    ? "Review the event, then approve it or send it back to the organizers."
    : NEXT_STEP_HINTS[event.status];

  function changeStatus(target: EventStatus) {
    runAction(() => changeEventStatus(event.id, target), `Status changed to "${EVENT_STATUS_LABELS[target]}".`);
  }

  function confirmCancellation() {
    const succeeded = runAction(
      () => changeEventStatus(event.id, "CANCELLED", cancellationReason),
      "The event was cancelled and the participants were notified.",
    );
    if (succeeded) setIsCancelling(false);
  }

  return (
    <Card>
      {event.status === "CANCELLED" ? (
        <Notice tone="danger" title="This event was cancelled">{event.cancellationReason}</Notice>
      ) : (
        <LifecycleProgress status={event.status} />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted">{hint}</p>
        <div className="flex flex-wrap gap-2">
          {nextSteps.map((target, index) => (
            <Button
              key={target}
              size="sm"
              variant={index === 0 ? "primary" : "secondary"}
              onClick={() => changeStatus(target)}
            >
              {transitionLabel(event.status, target)}
            </Button>
          ))}
          {canCancel && !isCancelling && (
            <Button size="sm" variant="ghost" className="text-danger" onClick={() => setIsCancelling(true)}>
              Cancel event
            </Button>
          )}
        </div>
      </div>

      {isCancelling && (
        <div className="mt-4 space-y-3 rounded-lg border border-danger/40 border-l-4 border-l-danger bg-surface p-4">
          <Field
            label="Why is the event cancelled?"
            htmlFor="cancellation-reason"
            hint="Every registered participant receives this message."
          >
            <Textarea
              id="cancellation-reason"
              maxLength={255}
              rows={2}
              value={cancellationReason}
              onChange={(changeEvent) => setCancellationReason(changeEvent.target.value)}
            />
          </Field>
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={confirmCancellation} disabled={cancellationReason.trim() === ""}>
              Cancel the event
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsCancelling(false)}>Keep the event</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function LifecycleProgress({ status }: { status: EventStatus }) {
  const currentIndex = LIFECYCLE_STEPS.indexOf(status);

  return (
    <ol className="flex gap-1 overflow-x-auto pb-1" aria-label="Event lifecycle">
      {LIFECYCLE_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="min-w-24 flex-1" aria-current={isCurrent ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${isDone || isCurrent ? "bg-primary" : "bg-surface-muted"}`} />
            <p className={`mt-2 text-xs ${isCurrent ? "font-semibold text-primary" : isDone ? "text-foreground" : "text-muted"}`}>
              {EVENT_STATUS_LABELS[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
