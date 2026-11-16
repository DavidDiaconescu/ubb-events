"use client";

import { useState } from "react";
import { CheckInCode } from "@/components/check-in-code";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";
import { cancelRegistration } from "@/lib/actions";
import { useNow } from "@/lib/hooks";
import { runAction } from "@/lib/toast";
import type { Registration, UbbEvent } from "@/lib/types";

const LATE_CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

/** A confirmed place (with the check-in code) or a waitlist position, and the option to cancel it. */
export function ActiveRegistration({ event, registration }: { event: UbbEvent; registration: Registration }) {
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
          <Notice tone="success" title="You are registered!">Show this code to the organizers at the entrance.</Notice>
          <CheckInCode code={registration.checkInCode} />
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
