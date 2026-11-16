"use client";

import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/form";
import { addOrganizer } from "@/lib/actions";
import { fullName } from "@/lib/format";
import { ORGANIZER_ROLE_LABELS } from "@/lib/labels";
import { isActiveMember } from "@/lib/permissions";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { OrganizerRole, UbbEvent, User } from "@/lib/types";

/** Add a person to the organizing team; members of the organization are listed first. */
export function AddOrganizerForm({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<OrganizerRole>("ORGANIZER");

  const candidates = state.users.filter(
    (user) => user.enabled && !state.eventOrganizers.some((organizer) => organizer.eventId === event.id && organizer.userId === user.id),
  );
  const members = candidates.filter((user) => isActiveMember(state, user.id, event.organizationId));
  const others = candidates.filter((user) => !isActiveMember(state, user.id, event.organizationId));

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const name = userDisplayName(state, Number(userId));
    if (await runAction(() => addOrganizer(event.id, Number(userId), role), `${name} joined the organizing team.`)) {
      setUserId("");
    }
  }

  return (
    <CardSection title="Add an organizer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Person" htmlFor="organizer-user">
          <Select id="organizer-user" value={userId} onChange={(changeEvent) => setUserId(changeEvent.target.value)}>
            <option value="">Choose a person</option>
            <UserOptions label="Members of the organization" users={members} />
            <UserOptions label="Other users" users={others} />
          </Select>
        </Field>
        <Field label="Role" htmlFor="organizer-role">
          <Select id="organizer-role" value={role} onChange={(changeEvent) => setRole(changeEvent.target.value as OrganizerRole)}>
            <option value="ORGANIZER">{ORGANIZER_ROLE_LABELS.ORGANIZER}</option>
            <option value="LEAD">{ORGANIZER_ROLE_LABELS.LEAD}</option>
          </Select>
        </Field>
        <Button type="submit" disabled={userId === ""}>
          <Plus className="size-4" aria-hidden="true" />
          Add to team
        </Button>
      </form>
    </CardSection>
  );
}

function UserOptions({ label, users }: { label: string; users: User[] }) {
  if (users.length === 0) return null;
  return (
    <optgroup label={label}>
      {users.map((user) => <option key={user.id} value={user.id}>{fullName(user)}</option>)}
    </optgroup>
  );
}
