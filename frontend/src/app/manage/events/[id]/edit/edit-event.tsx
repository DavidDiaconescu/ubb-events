"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { EventForm } from "@/components/event-form";
import { NotFoundMessage, parseId } from "@/components/not-found-message";
import { Notice } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { EDITABLE_STATUSES } from "@/lib/event-lifecycle";
import type { EventInput } from "@/lib/event-validation";
import { EVENT_STATUS_LABELS } from "@/lib/labels";
import { updateEvent } from "@/lib/mock-api";
import { canManageEvent } from "@/lib/permissions";
import { findEventById } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { UbbEvent } from "@/lib/types";

export function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useAppState();
  const user = useCurrentUser();

  const eventId = parseId(id);
  const event = eventId === null ? undefined : findEventById(state, eventId);
  if (!event || !canManageEvent(state, user, event)) {
    return <NotFoundMessage title="Event not found" backHref="/manage" backLabel="Manage events" />;
  }

  const backLink = { href: `/manage/events/${event.id}`, label: event.title };

  if (!EDITABLE_STATUSES.includes(event.status)) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader backLink={backLink} title="Edit event" />
        <Notice tone="warning" title="This event can no longer be edited">
          Events can only be changed until they start. Current status: {EVENT_STATUS_LABELS[event.status]}.
        </Notice>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backLink={backLink} title="Edit event" description={event.title} />
      <EditEventForm event={event} />
    </div>
  );
}

function EditEventForm({ event }: { event: UbbEvent }) {
  const router = useRouter();
  const state = useAppState();
  // The version the form was opened with; saving fails if someone else changed the event meanwhile.
  const [loadedVersion] = useState(event.version);
  const organization = state.organizations.filter((item) => item.id === event.organizationId);

  function handleSubmit(input: EventInput) {
    if (runAction(() => updateEvent(event.id, input, loadedVersion), "The event was updated.")) {
      router.push(`/manage/events/${event.id}`);
    }
  }

  return (
    <>
      {event.status === "PUBLISHED" || event.status === "REGISTRATION_CLOSED" ? (
        <div className="mb-6">
          <Notice tone="warning">Registered participants will be notified about the changes.</Notice>
        </div>
      ) : null}
      <EventForm
        organizations={organization}
        initialValues={event}
        lockOrganization
        submitLabel="Save changes"
        cancelHref={`/manage/events/${event.id}`}
        onSubmit={handleSubmit}
      />
    </>
  );
}
