"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { EmptyState, Notice } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { formatDateTime } from "@/lib/format";
import { AUDIENCE_LABELS } from "@/lib/labels";
import { createAnnouncement } from "@/lib/mock-api";
import { isEventOrganizer } from "@/lib/permissions";
import { userDisplayName } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { Audience, UbbEvent } from "@/lib/types";

export function AnnouncementsTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const user = useCurrentUser();

  const announcements = state.announcements
    .filter((announcement) => announcement.eventId === event.id)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const canSend = user !== null && isEventOrganizer(state, user.id, event.id);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <CardSection title="Sent announcements" className="lg:col-span-2">
        {announcements.length === 0 ? (
          <EmptyState title="No announcements yet" />
        ) : (
          <ul className="space-y-4">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{announcement.title}</p>
                  <Badge>{AUDIENCE_LABELS[announcement.audience]}</Badge>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm">{announcement.content}</p>
                <p className="mt-2 text-xs text-muted">
                  {userDisplayName(state, announcement.authorId)} · {formatDateTime(announcement.sentAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardSection>

      {canSend ? (
        <NewAnnouncementForm event={event} />
      ) : (
        <Notice title="Only organizers can send announcements">
          Add yourself to the organizing team in the Organizers tab to send announcements.
        </Notice>
      )}
    </div>
  );
}

function NewAnnouncementForm({ event }: { event: UbbEvent }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<Audience>("ALL_REGISTERED");

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const succeeded = runAction(
      () => createAnnouncement(event.id, { title, content, audience }),
      "The announcement was sent.",
    );
    if (succeeded) {
      setTitle("");
      setContent("");
    }
  }

  return (
    <CardSection title="New announcement" description="Recipients get an in-app notification." className="self-start">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" htmlFor="announcement-title">
          <Input id="announcement-title" maxLength={255} value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} />
        </Field>
        <Field label="Message" htmlFor="announcement-content">
          <Textarea id="announcement-content" rows={5} value={content} onChange={(changeEvent) => setContent(changeEvent.target.value)} />
        </Field>
        <Field label="Send to" htmlFor="announcement-audience">
          <Select
            id="announcement-audience"
            value={audience}
            onChange={(changeEvent) => setAudience(changeEvent.target.value as Audience)}
          >
            {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Button type="submit" className="w-full" disabled={title.trim() === "" || content.trim() === ""}>
          Send announcement
        </Button>
      </form>
    </CardSection>
  );
}
