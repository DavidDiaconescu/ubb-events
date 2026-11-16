"use client";

import { ListTodo, Megaphone, MessageSquare, UserCog, Users } from "lucide-react";
import { use, useState } from "react";
import { NotFoundMessage, parseId } from "@/components/not-found-message";
import { StatTile } from "@/components/ui/stat-tile";
import { Tabs } from "@/components/ui/tabs";
import { canManageEvent } from "@/lib/permissions";
import { countRegistrations, countTakenPlaces, findEventById } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";
import { AnnouncementsTab } from "./announcements-tab";
import { FeedbackTab } from "./feedback-tab";
import { LifecyclePanel } from "./lifecycle-panel";
import { ManageEventHeader } from "./manage-event-header";
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

  const ofEvent = <T extends { eventId: number }>(items: T[]) => items.filter((item) => item.eventId === event.id);
  const tasks = ofEvent(state.tasks);

  return (
    <div>
      <ManageEventHeader event={event} />

      <div className="mb-6 space-y-4">
        <LifecyclePanel event={event} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Places taken" value={`${countTakenPlaces(state, event.id)} / ${event.capacity}`} />
          <StatTile label="On waitlist" value={countRegistrations(state, event.id, "WAITLISTED")} />
          <StatTile label="Checked in" value={countRegistrations(state, event.id, "ATTENDED")} />
          <StatTile label="Open tasks" value={tasks.filter((task) => task.status !== "DONE").length} />
        </div>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "participants", label: "Participants", count: ofEvent(state.registrations).length, icon: Users },
          { id: "organizers", label: "Organizers", count: ofEvent(state.eventOrganizers).length, icon: UserCog },
          { id: "tasks", label: "Tasks", count: tasks.length, icon: ListTodo },
          { id: "announcements", label: "Announcements", count: ofEvent(state.announcements).length, icon: Megaphone },
          { id: "feedback", label: "Feedback", count: ofEvent(state.feedback).length, icon: MessageSquare },
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
