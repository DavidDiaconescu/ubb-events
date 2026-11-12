"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/form";
import { fullName } from "@/lib/format";
import { ORGANIZER_ROLE_LABELS } from "@/lib/labels";
import { addOrganizer, removeOrganizer } from "@/lib/mock-api";
import { isActiveMember } from "@/lib/permissions";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { OrganizerRole, UbbEvent } from "@/lib/types";

export function OrganizersTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const organizers = state.eventOrganizers
    .filter((organizer) => organizer.eventId === event.id)
    .sort((a, b) => (a.role === b.role ? a.id - b.id : a.role === "LEAD" ? -1 : 1));

  function handleRemove(organizerId: number, name: string) {
    runAction(() => removeOrganizer(organizerId), `${name} was removed from the organizing team.`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CardSection title="Organizing team" description="Organizers can be assigned tasks and can send announcements.">
        <ul className="divide-y divide-border">
          {organizers.map((organizer) => {
            const name = userDisplayName(state, organizer.userId);
            return (
              <li key={organizer.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{name}</span>
                  <Badge tone={organizer.role === "LEAD" ? "blue" : "neutral"}>{ORGANIZER_ROLE_LABELS[organizer.role]}</Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleRemove(organizer.id, name)}>Remove</Button>
              </li>
            );
          })}
        </ul>
      </CardSection>

      <AddOrganizerForm event={event} />
    </div>
  );
}

function AddOrganizerForm({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<OrganizerRole>("ORGANIZER");

  const candidates = state.users.filter(
    (user) =>
      user.enabled &&
      !state.eventOrganizers.some((organizer) => organizer.eventId === event.id && organizer.userId === user.id),
  );
  // Members of the organizing organization are the most likely candidates, so list them first.
  const members = candidates.filter((user) => isActiveMember(state, user.id, event.organizationId));
  const others = candidates.filter((user) => !isActiveMember(state, user.id, event.organizationId));

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const name = userDisplayName(state, Number(userId));
    if (runAction(() => addOrganizer(event.id, Number(userId), role), `${name} joined the organizing team.`)) {
      setUserId("");
    }
  }

  return (
    <CardSection title="Add an organizer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Person" htmlFor="organizer-user">
          <Select id="organizer-user" value={userId} onChange={(changeEvent) => setUserId(changeEvent.target.value)}>
            <option value="">Choose a person</option>
            {members.length > 0 && (
              <optgroup label="Members of the organization">
                {members.map((user) => <option key={user.id} value={user.id}>{fullName(user)}</option>)}
              </optgroup>
            )}
            {others.length > 0 && (
              <optgroup label="Other users">
                {others.map((user) => <option key={user.id} value={user.id}>{fullName(user)}</option>)}
              </optgroup>
            )}
          </Select>
        </Field>
        <Field label="Role" htmlFor="organizer-role">
          <Select id="organizer-role" value={role} onChange={(changeEvent) => setRole(changeEvent.target.value as OrganizerRole)}>
            <option value="ORGANIZER">{ORGANIZER_ROLE_LABELS.ORGANIZER}</option>
            <option value="LEAD">{ORGANIZER_ROLE_LABELS.LEAD}</option>
          </Select>
        </Field>
        <Button type="submit" disabled={userId === ""}>Add to team</Button>
      </form>
    </CardSection>
  );
}
