"use client";

import { use, useState } from "react";
import { NotFoundMessage, parseId } from "@/components/not-found-message";
import { EventStatusBadge } from "@/components/status-badges";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { EDITABLE_STATUSES } from "@/lib/event-lifecycle";
import { formatEventTime } from "@/lib/format";
import { canManageEvent } from "@/lib/permissions";
import { countRegistrations, countTakenPlaces, findEventById, organizationName, venueLabel } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";
import { AnnouncementsTab } from "./announcements-tab";
import { FeedbackTab } from "./feedback-tab";
import { LifecyclePanel } from "./lifecycle-panel";
import { OrganizersTab } from "./organizers-tab";
import { ParticipantsTab } from "./participants-tab";
import { TasksTab } from "./tasks-tab";

type TabId = "participants" | "organizers" | "tasks" | "announcements" | "feedback";

export function ManageEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useAppState();
  const user = useCurrentUser();

  const eventId = parseId(id);
  const event = eventId === null ? undefined : findEventById(state, eventId);
  if (!event || !canManageEvent(state, user, event)) {
    return <NotFoundMessage title="Event not found" backHref="/manage" backLabel="Manage events" />;
  }

  return <ManageEventWorkspace event={event} />;
}

function ManageEventWorkspace({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const [activeTab, setActiveTab] = useState<TabId>("participants");

  const registrationCount = state.registrations.filter((registration) => registration.eventId === event.id).length;
  const organizerCount = state.eventOrganizers.filter((organizer) => organizer.eventId === event.id).length;
  const tasks = state.tasks.filter((task) => task.eventId === event.id);
  const announcementCount = state.announcements.filter((announcement) => announcement.eventId === event.id).length;
  const feedbackCount = state.feedback.filter((item) => item.eventId === event.id).length;

  return (
    <div>
      <PageHeader
        backLink={{ href: "/manage", label: "Manage events" }}
        title={event.title}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <EventStatusBadge status={event.status} />
            <span>{organizationName(state, event.organizationId)}</span>
            <span>{formatEventTime(event.startTime, event.endTime)}</span>
            <span>{venueLabel(state, event.venueId)}</span>
          </span>
        }
        actions={
          <>
            <ButtonLink href={`/events/${event.id}`} variant="secondary" size="sm">View public page</ButtonLink>
            {EDITABLE_STATUSES.includes(event.status) && (
              <ButtonLink href={`/manage/events/${event.id}/edit`} size="sm">Edit details</ButtonLink>
            )}
          </>
        }
      />

      <div className="mb-6 space-y-4">
        <LifecyclePanel event={event} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Places taken" value={`${countTakenPlaces(state, event.id)} / ${event.capacity}`} />
          <Stat label="On waitlist" value={countRegistrations(state, event.id, "WAITLISTED")} />
          <Stat label="Checked in" value={countRegistrations(state, event.id, "ATTENDED")} />
          <Stat label="Open tasks" value={tasks.filter((task) => task.status !== "DONE").length} />
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "participants", label: "Participants", count: registrationCount },
          { id: "organizers", label: "Organizers", count: organizerCount },
          { id: "tasks", label: "Tasks", count: tasks.length },
          { id: "announcements", label: "Announcements", count: announcementCount },
          { id: "feedback", label: "Feedback", count: feedbackCount },
        ]}
      />

      {activeTab === "participants" && <ParticipantsTab event={event} />}
      {activeTab === "organizers" && <OrganizersTab event={event} />}
      {activeTab === "tasks" && <TasksTab event={event} />}
      {activeTab === "announcements" && <AnnouncementsTab event={event} />}
      {activeTab === "feedback" && <FeedbackTab event={event} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
