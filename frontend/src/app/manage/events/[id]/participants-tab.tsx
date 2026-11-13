"use client";

import { QrCode, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { RegistrationStatusBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import { REGISTRATION_STATUS_LABELS } from "@/lib/labels";
import { checkIn } from "@/lib/mock-api";
import { registrationsOf, userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction, showToast } from "@/lib/toast";
import type { EventStatus, Registration, RegistrationStatus, UbbEvent } from "@/lib/types";

const CHECK_IN_EVENT_STATUSES: EventStatus[] = ["PUBLISHED", "REGISTRATION_CLOSED", "ONGOING"];

/** Order in which registrations are listed. */
const STATUS_ORDER: RegistrationStatus[] = [
  "CONFIRMED",
  "WAITLISTED",
  "ATTENDED",
  "ABSENT",
  "CANCELLED",
  "CANCELLED_BY_ORGANIZER",
];

export function ParticipantsTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "">("");

  const canCheckIn = CHECK_IN_EVENT_STATUSES.includes(event.status);
  const registrations = registrationsOf(state, event.id)
    .filter((registration) => statusFilter === "" || registration.status === statusFilter)
    .sort(compareRegistrations);

  function handleCheckIn(registration: Registration) {
    runAction(
      () => checkIn(event.id, registration.checkInCode),
      `${userDisplayName(state, registration.userId)} was checked in.`,
    );
  }

  return (
    <div className="space-y-6">
      {canCheckIn && <CheckInForm event={event} />}

      <CardSection
        title="Registrations"
        action={
          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(changeEvent) => setStatusFilter(changeEvent.target.value as RegistrationStatus | "")}
            className="w-48"
          >
            <option value="">All statuses</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>{REGISTRATION_STATUS_LABELS[status]}</option>
            ))}
          </Select>
        }
      >
        {registrations.length === 0 ? (
          <EmptyState icon={Users} title="No registrations" />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-y border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-5 py-2 font-medium">Participant</th>
                  <th scope="col" className="px-5 py-2 font-medium">Status</th>
                  <th scope="col" className="px-5 py-2 font-medium">Registered</th>
                  <th scope="col" className="px-5 py-2 font-medium">Details</th>
                  <th scope="col" className="px-5 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {registrations.map((registration) => {
                  const user = state.users.find((item) => item.id === registration.userId);
                  return (
                    <tr key={registration.id} className="transition-colors hover:bg-surface-muted">
                      <td className="px-5 py-3">
                        <p className="font-medium">{userDisplayName(state, registration.userId)}</p>
                        <p className="text-xs text-muted">{user?.email}</p>
                      </td>
                      <td className="px-5 py-3"><RegistrationStatusBadge status={registration.status} /></td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDateTime(registration.registeredAt)}</td>
                      <td className="px-5 py-3 text-muted">{registrationDetails(registration)}</td>
                      <td className="px-5 py-3 text-right">
                        {canCheckIn && registration.status === "CONFIRMED" && (
                          <Button size="sm" variant="secondary" onClick={() => handleCheckIn(registration)}>
                            <QrCode className="size-4" aria-hidden="true" />
                            Check in
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardSection>
    </div>
  );
}

function CheckInForm({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const [code, setCode] = useState("");

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    let participantName = "";
    const succeeded = runAction(() => {
      const registration = checkIn(event.id, code);
      participantName = userDisplayName(state, registration.userId);
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

function compareRegistrations(a: Registration, b: Registration): number {
  const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  if (byStatus !== 0) return byStatus;
  if (a.status === "WAITLISTED") return (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0);
  return a.registeredAt.localeCompare(b.registeredAt);
}

function registrationDetails(registration: Registration): string {
  if (registration.status === "WAITLISTED") return `Position ${registration.waitlistPosition}`;
  if (registration.checkedInAt) return `Checked in ${formatDateTime(registration.checkedInAt)}`;
  if (registration.lateCancellation) return "Late cancellation";
  return "";
}
