"use client";

import { QrCode } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { checkIn } from "@/lib/actions";
import { userDisplayName } from "@/lib/queries";
import { getState } from "@/lib/store";
import { runAction, showToast } from "@/lib/toast";
import type { UbbEvent } from "@/lib/types";

/** Check a participant in by the code they show at the entrance. */
export function CheckInForm({ event }: { event: UbbEvent }) {
  const [code, setCode] = useState("");

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    let participantName = "";
    const succeeded = await runAction(async () => {
      const registration = await checkIn(event.id, code);
      participantName = userDisplayName(getState(), registration.userId);
    });
    if (succeeded) {
      showToast(`${participantName} was checked in.`);
      setCode("");
    }
  }

  return (
    <CardSection title="Check-in" description="Enter the code shown by the participant, e.g. UBB-7K2Q-41.">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <Input
          aria-label="Check-in code"
          placeholder="UBB-XXXX-00"
          value={code}
          onChange={(changeEvent) => setCode(changeEvent.target.value)}
          className="max-w-xs font-mono uppercase"
          autoComplete="off"
        />
        <Button type="submit" disabled={code.trim() === ""}>
          <QrCode className="size-4" aria-hidden="true" />
          Check in
        </Button>
      </form>
    </CardSection>
  );
}
