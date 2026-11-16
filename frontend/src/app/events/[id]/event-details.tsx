"use client";

import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { AnnouncementItem } from "@/components/announcement-item";
import { NotFoundMessage, parseId } from "@/components/not-found-message";
import { CategoryBadge, EventStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { canManageEvent, canViewEvent } from "@/lib/permissions";
import { findEventById, organizationName, visibleAnnouncements } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import { EventFacts } from "./event-facts";
import { FeedbackSummary } from "./feedback-summary";
import { RegistrationPanel } from "./registration-panel";

export function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useAppState();
  const user = useCurrentUser();

  const eventId = parseId(id);
  const event = eventId === null ? undefined : findEventById(state, eventId);
  if (!event || !canViewEvent(state, user, event)) {
    return <NotFoundMessage title="Event not found" backHref="/events" backLabel="Back to events" />;
  }

  const announcements = visibleAnnouncements(state, user, event);

  return (
    <div>
      <Link href="/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All events
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <CategoryBadge category={event.category} />
              <EventStatusBadge status={event.status} />
              {event.visibility === "MEMBERS_ONLY" && <Badge tone="amber">Members only</Badge>}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{event.title}</h1>
            <p className="mt-2 text-muted">
              Organized by{" "}
              <Link href={`/organizations/${event.organizationId}`} className="font-medium text-primary hover:underline">
                {organizationName(state, event.organizationId)}
              </Link>
            </p>
            {canManageEvent(state, user, event) && (
              <ButtonLink href={`/manage/events/${event.id}`} variant="secondary" size="sm" className="mt-4">
                <LayoutDashboard className="size-4" aria-hidden="true" />
                Manage this event
              </ButtonLink>
            )}
          </div>

          {event.status === "CANCELLED" && <Notice tone="danger" title="This event was cancelled">{event.cancellationReason}</Notice>}

          <EventFacts event={event} />

          {announcements.length > 0 && (
            <CardSection title="Announcements" description="Messages from the organizers.">
              <ul className="space-y-4">
                {announcements.map((announcement) => <AnnouncementItem key={announcement.id} announcement={announcement} />)}
              </ul>
            </CardSection>
          )}

          <FeedbackSummary event={event} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RegistrationPanel event={event} />
        </aside>
      </div>
    </div>
  );
}
