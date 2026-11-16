"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { removeOrganizer } from "@/lib/actions";
import { ORGANIZER_ROLE_LABELS } from "@/lib/labels";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { UbbEvent } from "@/lib/types";
import { AddOrganizerForm } from "./add-organizer-form";

export function OrganizersTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const organizers = state.eventOrganizers
    .filter((organizer) => organizer.eventId === event.id)
    .sort((a, b) => (a.role === b.role ? a.id - b.id : a.role === "LEAD" ? -1 : 1));

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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => runAction(() => removeOrganizer(organizer.id), `${name} was removed from the organizing team.`)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
      </CardSection>
      <AddOrganizerForm event={event} />
    </div>
  );
}
