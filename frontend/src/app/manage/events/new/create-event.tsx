"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { AccessDenied, SignInRequired } from "@/components/sign-in-required";
import { Notice } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import type { EventInput } from "@/lib/event-validation";
import { createEvent } from "@/lib/mock-api";
import { organizationsUserCanCreateEventsFor } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";

export function CreateEvent() {
  const router = useRouter();
  const state = useAppState();
  const user = useCurrentUser();

  if (user === null) return <SignInRequired />;

  const organizations = organizationsUserCanCreateEventsFor(state, user);
  if (organizations.length === 0) return <AccessDenied />;

  function handleSubmit(input: EventInput) {
    let newEventId = 0;
    const succeeded = runAction(() => {
      newEventId = createEvent(input);
    }, "The event was saved as a draft.");
    if (succeeded) {
      router.push(`/manage/events/${newEventId}`);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        backLink={{ href: "/manage", label: "Manage events" }}
        title="New event"
        description="The event is saved as a draft. Submit it for approval when it is ready."
      />
      <div className="mb-6">
        <Notice>You will become the lead organizer of the event and can add other organizers afterwards.</Notice>
      </div>
      <EventForm organizations={organizations} submitLabel="Save draft" cancelHref="/manage" onSubmit={handleSubmit} />
    </div>
  );
}
