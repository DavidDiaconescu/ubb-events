"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/form";
import { changeEventStatus } from "@/lib/actions";
import { runAction } from "@/lib/toast";

/** "Cancel event" button that expands into a form asking for the reason sent to the participants. */
export function CancelEventForm({ eventId }: { eventId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function confirmCancellation() {
    const succeeded = await runAction(
      () => changeEventStatus(eventId, "CANCELLED", reason),
      "The event was cancelled and the participants were notified.",
    );
    if (succeeded) setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <div className="mt-2 flex justify-end">
        <Button size="sm" variant="ghost" className="text-danger" onClick={() => setIsOpen(true)}>Cancel event</Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-danger/40 border-l-4 border-l-danger bg-surface p-4">
      <Field label="Why is the event cancelled?" htmlFor="cancellation-reason" hint="Every registered participant receives this message.">
        <Textarea
          id="cancellation-reason"
          maxLength={255}
          rows={2}
          value={reason}
          onChange={(changeEvent) => setReason(changeEvent.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant="danger" onClick={confirmCancellation} disabled={reason.trim() === ""}>Cancel the event</Button>
        <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>Keep the event</Button>
      </div>
    </div>
  );
}
