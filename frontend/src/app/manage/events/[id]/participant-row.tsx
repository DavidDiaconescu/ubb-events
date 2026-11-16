"use client";

import { QrCode } from "lucide-react";
import { RegistrationStatusBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { Registration } from "@/lib/types";

/** One registration in the participants table; `onCheckIn` is given only when check-in is possible. */
export function ParticipantRow({ registration, onCheckIn }: { registration: Registration; onCheckIn?: () => void }) {
  const state = useAppState();
  const email = state.users.find((item) => item.id === registration.userId)?.email;

  return (
    <tr className="transition-colors hover:bg-surface-muted">
      <td className="px-5 py-3">
        <p className="font-medium">{userDisplayName(state, registration.userId)}</p>
        <p className="text-xs text-muted">{email}</p>
      </td>
      <td className="px-5 py-3"><RegistrationStatusBadge status={registration.status} /></td>
      <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDateTime(registration.registeredAt)}</td>
      <td className="px-5 py-3 text-muted">{registrationDetails(registration)}</td>
      <td className="px-5 py-3 text-right">
        {onCheckIn && (
          <Button size="sm" variant="secondary" onClick={onCheckIn}>
            <QrCode className="size-4" aria-hidden="true" />
            Check in
          </Button>
        )}
      </td>
    </tr>
  );
}

function registrationDetails(registration: Registration): string {
  if (registration.status === "WAITLISTED") return `Position ${registration.waitlistPosition}`;
  if (registration.checkedInAt) return `Checked in ${formatDateTime(registration.checkedInAt)}`;
  if (registration.lateCancellation) return "Late cancellation";
  return "";
}
