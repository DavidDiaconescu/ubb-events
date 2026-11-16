"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form";
import { CardTable, Table } from "@/components/ui/table";
import { checkIn } from "@/lib/actions";
import { REGISTRATION_STATUS_LABELS } from "@/lib/labels";
import { registrationsOf, userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { EventStatus, Registration, RegistrationStatus, UbbEvent } from "@/lib/types";
import { CheckInForm } from "./check-in-form";
import { ParticipantRow } from "./participant-row";

const CHECK_IN_EVENT_STATUSES: EventStatus[] = ["PUBLISHED", "REGISTRATION_CLOSED", "ONGOING"];
/** Order in which registrations are listed. */
const STATUS_ORDER: RegistrationStatus[] = ["CONFIRMED", "WAITLISTED", "ATTENDED", "ABSENT", "CANCELLED", "CANCELLED_BY_ORGANIZER"];
const COLUMNS = [{ label: "Participant" }, { label: "Status" }, { label: "Registered" }, { label: "Details" }, { label: "Actions", hidden: true }];

export function ParticipantsTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "">("");

  const canCheckIn = CHECK_IN_EVENT_STATUSES.includes(event.status);
  const registrations = registrationsOf(state, event.id)
    .filter((registration) => statusFilter === "" || registration.status === statusFilter)
    .sort(compareRegistrations);

  function handleCheckIn(registration: Registration) {
    const code = registration.checkInCode;
    if (code === null) return; // managers always receive the codes
    runAction(() => checkIn(event.id, code), `${userDisplayName(state, registration.userId)} was checked in.`);
  }

  const statusSelect = (
    <Select aria-label="Filter by status" value={statusFilter} className="w-48"
      onChange={(changeEvent) => setStatusFilter(changeEvent.target.value as RegistrationStatus | "")}>
      <option value="">All statuses</option>
      {STATUS_ORDER.map((status) => <option key={status} value={status}>{REGISTRATION_STATUS_LABELS[status]}</option>)}
    </Select>
  );

  return (
    <div className="space-y-6">
      {canCheckIn && <CheckInForm event={event} />}
      <CardSection title="Registrations" action={statusSelect}>
        {registrations.length === 0 ? (
          <EmptyState icon={Users} title="No registrations" />
        ) : (
          <CardTable>
            <Table columns={COLUMNS}>
              {registrations.map((registration) => (
                <ParticipantRow
                  key={registration.id}
                  registration={registration}
                  onCheckIn={canCheckIn && registration.status === "CONFIRMED" ? () => handleCheckIn(registration) : undefined}
                />
              ))}
            </Table>
          </CardTable>
        )}
      </CardSection>
    </div>
  );
}

function compareRegistrations(a: Registration, b: Registration): number {
  const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  if (byStatus !== 0) return byStatus;
  if (a.status === "WAITLISTED") return (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0);
  return a.registeredAt.localeCompare(b.registeredAt);
}
