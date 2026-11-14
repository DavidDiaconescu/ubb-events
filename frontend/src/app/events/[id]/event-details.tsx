"use client";

import { ArrowLeft, CalendarDays, Clock, LayoutDashboard, MapPin, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { NotFoundMessage, parseId } from "@/components/not-found-message";
import { CategoryBadge, EventStatusBadge } from "@/components/status-badges";
import { StarDisplay } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { formatDate, formatDateTime, formatEventTime } from "@/lib/format";
import { canManageEvent, canViewEvent } from "@/lib/permissions";
import { averageRating, findEventById, organizationName, userDisplayName } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { Announcement, AppState, UbbEvent, User } from "@/lib/types";
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

  const venue = state.venues.find((item) => item.id === event.venueId);
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

          {event.status === "CANCELLED" && (
            <Notice tone="danger" title="This event was cancelled">{event.cancellationReason}</Notice>
          )}

          <CardSection title="Details">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail icon={CalendarDays} label="When" value={formatEventTime(event.startTime, event.endTime)} />
              <Detail
                icon={MapPin}
                label="Where"
                value={venue ? (venue.online ? venue.name : `${venue.name}, ${venue.address}`) : "Venue to be announced"}
              />
              <Detail
                icon={Clock}
                label="Registration period"
                value={`${formatDateTime(event.registrationOpensAt)} – ${formatDateTime(event.registrationClosesAt)}`}
              />
              <Detail
                icon={Users}
                label="Who can register"
                value={event.visibility === "PUBLIC" ? "Everyone" : "Members of the organization"}
              />
            </dl>
            <p className="mt-5 whitespace-pre-line border-t border-border pt-5 leading-relaxed">{event.description}</p>
          </CardSection>

          {announcements.length > 0 && (
            <CardSection title="Announcements" description="Messages from the organizers.">
              <ul className="space-y-4">
                {announcements.map((announcement) => (
                  <li key={announcement.id} className="rounded-lg bg-surface-muted p-4">
                    <p className="font-medium">{announcement.title}</p>
                    <p className="mt-1 whitespace-pre-line text-sm">{announcement.content}</p>
                    <p className="mt-2 text-xs text-muted">
                      {userDisplayName(state, announcement.authorId)} · {formatDateTime(announcement.sentAt)}
                    </p>
                  </li>
                ))}
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

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
        <dd className="mt-1">{value}</dd>
      </div>
    </div>
  );
}

/** Same audience rules as the notifications sent by the backend. */
function visibleAnnouncements(state: AppState, user: User | null, event: UbbEvent): Announcement[] {
  if (user === null) return [];

  const isOrganizer = canManageEvent(state, user, event);
  const statuses = state.registrations
    .filter((registration) => registration.eventId === event.id && registration.userId === user.id)
    .map((registration) => registration.status);
  const isRegistered = statuses.some((status) => ["CONFIRMED", "WAITLISTED", "ATTENDED", "ABSENT"].includes(status));
  const isConfirmed = statuses.some((status) => ["CONFIRMED", "ATTENDED", "ABSENT"].includes(status));

  return state.announcements
    .filter((announcement) => announcement.eventId === event.id)
    .filter((announcement) => {
      if (isOrganizer) return true;
      if (announcement.audience === "ALL_REGISTERED") return isRegistered;
      if (announcement.audience === "CONFIRMED_ONLY") return isConfirmed;
      return false;
    })
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

function FeedbackSummary({ event }: { event: UbbEvent }) {
  const state = useAppState();
  if (event.status !== "FINISHED" && event.status !== "ARCHIVED") return null;

  const { average, count } = averageRating(state, event.id);
  const feedbackWithComments = state.feedback
    .filter((item) => item.eventId === event.id && item.comment)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <CardSection title="Participant feedback">
      {count === 0 ? (
        <p className="text-sm text-muted">No feedback has been submitted yet.</p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold">{average.toFixed(1)}</span>
            <div>
              <StarDisplay rating={average} />
              <p className="text-xs text-muted">{count} {count === 1 ? "review" : "reviews"}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-4 border-t border-border pt-5">
            {feedbackWithComments.map((item) => (
              <li key={item.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <StarDisplay rating={item.rating} />
                  <span className="text-xs text-muted">
                    {item.anonymous ? "Anonymous" : userDisplayName(state, item.userId)} · {formatDate(item.submittedAt)}
                  </span>
                </div>
                <p className="mt-1">{item.comment}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </CardSection>
  );
}
