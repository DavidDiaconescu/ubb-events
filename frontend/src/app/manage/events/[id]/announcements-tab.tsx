"use client";

import { Megaphone } from "lucide-react";
import type { FormEvent } from "react";
import { AnnouncementItem } from "@/components/announcement-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { createAnnouncement } from "@/lib/actions";
import { AUDIENCE_LABELS } from "@/lib/labels";
import { announcementsOf } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { Audience, UbbEvent } from "@/lib/types";
import { useFormState } from "@/lib/use-form-state";

export function AnnouncementsTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const announcements = announcementsOf(state, event.id);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <CardSection title="Sent announcements" className="lg:col-span-2">
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" />
        ) : (
          <ul className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                badge={<Badge>{AUDIENCE_LABELS[announcement.audience]}</Badge>}
                className="rounded-lg border border-border p-4"
              />
            ))}
          </ul>
        )}
      </CardSection>
      <NewAnnouncementForm event={event} />
    </div>
  );
}

/** Every manager of the event can send announcements (the backend checks the same rule). */
function NewAnnouncementForm({ event }: { event: UbbEvent }) {
  const { values, setField, reset } = useFormState({ title: "", content: "", audience: "ALL_REGISTERED" as Audience });

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (await runAction(() => createAnnouncement(event.id, values), "The announcement was sent.")) {
      reset(["title", "content"]);
    }
  }

  return (
    <CardSection title="New announcement" description="Recipients get an in-app notification." className="self-start">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" htmlFor="announcement-title">
          <Input id="announcement-title" maxLength={255} value={values.title} onChange={(e) => setField("title", e.target.value)} />
        </Field>
        <Field label="Message" htmlFor="announcement-content">
          <Textarea id="announcement-content" rows={5} value={values.content} onChange={(e) => setField("content", e.target.value)} />
        </Field>
        <Field label="Send to" htmlFor="announcement-audience">
          <Select id="announcement-audience" value={values.audience} onChange={(e) => setField("audience", e.target.value as Audience)}>
            {Object.entries(AUDIENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </Field>
        <Button type="submit" className="w-full" disabled={values.title.trim() === "" || values.content.trim() === ""}>
          <Megaphone className="size-4" aria-hidden="true" />
          Send announcement
        </Button>
      </form>
    </CardSection>
  );
}
