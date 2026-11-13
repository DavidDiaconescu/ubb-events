"use client";

import { CalendarCheck, CalendarDays, Compass } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { RegistrationStatusBadge } from "@/components/status-badges";
import { ButtonLink } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatCalendarDate, formatDateTime, formatEventTime } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { canManageEvent, describeRole, isAdmin } from "@/lib/permissions";
import { activeRegistrationOf, findEventById, sortByStartTime } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { AppState, UbbEvent, User } from "@/lib/types";

const MAX_SUGGESTIONS = 3;

export function HomeDashboard() {
  const user = useCurrentUser();
  return user ? <SignedInDashboard user={user} /> : <Welcome />;
}

function eventsOpenForRegistration(state: AppState, now: number): UbbEvent[] {
  return sortByStartTime(
    state.events.filter(
      (event) =>
        event.status === "PUBLISHED" &&
        Date.parse(event.registrationOpensAt) <= now &&
        now < Date.parse(event.registrationClosesAt),
    ),
  );
}

function Welcome() {
  const state = useAppState();
  const now = useNow();
  const openEvents = eventsOpenForRegistration(state, now).slice(0, MAX_SUGGESTIONS);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-primary-soft px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs text-primary-foreground" aria-hidden="true">
            UE
          </span>
          UBB Events
        </p>
        <p className="mt-4 text-sm font-medium text-primary">Babeș-Bolyai University · Student organizations</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Discover, join and organize student events in one place
        </h1>
        {/* foreground/80 instead of muted: muted on primary-soft is below 4.5:1. */}
        <p className="mx-auto mt-4 max-w-xl text-foreground/80">
          Workshops, conferences, trainings and competitions organized by UBB student organizations, from
          registration to check-in and feedback.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/events">
            <Compass className="size-4" aria-hidden="true" />
            Browse events
          </ButtonLink>
          <ButtonLink href="/login" variant="secondary">Sign in with a demo account</ButtonLink>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Open for registration</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {openEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SignedInDashboard({ user }: { user: User }) {
  const state = useAppState();
  const now = useNow();

  const myRegistrations = state.registrations
    .filter(
      (registration) =>
        registration.userId === user.id &&
        (registration.status === "CONFIRMED" || registration.status === "WAITLISTED"),
    )
    .map((registration) => ({ registration, event: findEventById(state, registration.eventId) }))
    .filter((item): item is { registration: typeof item.registration; event: UbbEvent } => item.event !== undefined)
    .sort((a, b) => a.event.startTime.localeCompare(b.event.startTime));

  const suggestions = eventsOpenForRegistration(state, now)
    .filter((event) => !activeRegistrationOf(state, event.id, user.id))
    .slice(0, MAX_SUGGESTIONS);

  const unreadNotifications = state.notifications
    .filter((notification) => notification.recipientId === user.id && !notification.read)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader title={`Hello, ${user.firstName}!`} description={describeRole(state, user)} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardSection
            title="Your upcoming events"
            action={<Link href="/my-events" className="text-sm font-medium text-primary">See all</Link>}
          >
            {myRegistrations.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="You are not registered for any event yet"
                action={<ButtonLink href="/events" size="sm">Discover events</ButtonLink>}
              />
            ) : (
              <ul className="-mx-2 divide-y divide-border">
                {myRegistrations.map(({ registration, event }) => (
                  <li
                    key={registration.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-surface-muted"
                  >
                    <div className="min-w-0">
                      <Link href={`/events/${event.id}`} className="font-medium hover:text-primary">
                        {event.title}
                      </Link>
                      <p className="text-sm text-muted">{formatEventTime(event.startTime, event.endTime)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {registration.status === "WAITLISTED" && (
                        <span className="text-xs text-muted">#{registration.waitlistPosition} in line</span>
                      )}
                      <RegistrationStatusBadge status={registration.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardSection>

          <section>
            <h2 className="mb-4 text-base font-semibold">Open for registration</h2>
            {suggestions.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No other events are open for registration right now" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {suggestions.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <CardSection
            title="Notifications"
            action={<Link href="/notifications" className="text-sm font-medium text-primary">Open</Link>}
          >
            {unreadNotifications.length === 0 ? (
              <p className="text-sm text-muted">You are all caught up.</p>
            ) : (
              <ul className="space-y-3">
                {unreadNotifications.slice(0, 3).map((notification) => (
                  <li key={notification.id} className="text-sm">
                    <p>{notification.message}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(notification.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardSection>

          <OrganizerSummary user={user} />
        </div>
      </div>
    </div>
  );
}

/** Shortcuts for coordinators, event organizers and administrators. */
function OrganizerSummary({ user }: { user: User }) {
  const state = useAppState();

  const managedEvents = state.events.filter((event) => canManageEvent(state, user, event));
  const openTasks = state.tasks.filter((task) => task.assigneeId === user.id && task.status !== "DONE");
  const pendingApprovals = state.events.filter((event) => event.status === "PENDING_APPROVAL");

  if (managedEvents.length === 0 && openTasks.length === 0 && !isAdmin(user)) {
    return null;
  }

  return (
    <CardSection title="Organizer corner">
      <ul className="space-y-3 text-sm">
        {isAdmin(user) && (
          <li className="flex items-center justify-between">
            <span>Events waiting for approval</span>
            <Link href="/admin" className="font-semibold text-primary">{pendingApprovals.length}</Link>
          </li>
        )}
        {managedEvents.length > 0 && (
          <li className="flex items-center justify-between">
            <span>Events you manage</span>
            <Link href="/manage" className="font-semibold text-primary">{managedEvents.length}</Link>
          </li>
        )}
      </ul>

      {openTasks.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Your open tasks</p>
          <ul className="space-y-2">
            {openTasks.map((task) => (
              <li key={task.id} className="text-sm">
                <Link href={`/manage/events/${task.eventId}`} className="hover:text-primary">{task.title}</Link>
                {task.dueDate && <span className="text-muted"> · due {formatCalendarDate(task.dueDate)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardSection>
  );
}
