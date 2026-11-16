"use client";

import Link from "next/link";
import { CardSection } from "@/components/ui/card";
import { formatCalendarDate } from "@/lib/format";
import { canManageEvent, isAdmin } from "@/lib/permissions";
import { useAppState } from "@/lib/store";
import type { User } from "@/lib/types";

/** Shortcuts for coordinators, event organizers and administrators. */
export function OrganizerSummary({ user }: { user: User }) {
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
        {isAdmin(user) && <SummaryRow label="Events waiting for approval" href="/admin" count={pendingApprovals.length} />}
        {managedEvents.length > 0 && <SummaryRow label="Events you manage" href="/manage" count={managedEvents.length} />}
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

function SummaryRow({ label, href, count }: { label: string; href: string; count: number }) {
  return (
    <li className="flex items-center justify-between">
      <span>{label}</span>
      <Link href={href} className="font-semibold text-primary">{count}</Link>
    </li>
  );
}
