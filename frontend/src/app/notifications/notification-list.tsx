"use client";

import {
  AlarmClock,
  ArrowUp,
  BadgeCheck,
  Bell,
  CircleCheck,
  CircleX,
  ListTodo,
  Megaphone,
  Pencil,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { SignInRequired } from "@/components/sign-in-required";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/format";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/mock-api";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { NotificationType } from "@/lib/types";

const TYPE_ICONS: Record<NotificationType, { Icon: LucideIcon; color: string }> = {
  REGISTRATION_CONFIRMED: { Icon: CircleCheck, color: "bg-success-soft text-success" },
  WAITLIST_PROMOTED: { Icon: ArrowUp, color: "bg-success-soft text-success" },
  EVENT_UPDATED: { Icon: Pencil, color: "bg-primary-soft text-primary" },
  EVENT_CANCELLED: { Icon: CircleX, color: "bg-danger-soft text-danger" },
  REMINDER: { Icon: AlarmClock, color: "bg-accent-soft text-accent" },
  APPROVAL_REQUEST: { Icon: ShieldCheck, color: "bg-warning-soft text-warning" },
  APPROVAL_RESULT: { Icon: BadgeCheck, color: "bg-info-soft text-info" },
  ANNOUNCEMENT: { Icon: Megaphone, color: "bg-primary-soft text-primary" },
  TASK_ASSIGNED: { Icon: ListTodo, color: "bg-primary-soft text-primary" },
};

export function NotificationList() {
  const state = useAppState();
  const user = useCurrentUser();

  if (user === null) {
    return <SignInRequired message="Sign in to see your notifications." />;
  }

  const notifications = state.notifications
    .filter((notification) => notification.recipientId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "You are all caught up."}
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllNotificationsAsRead}>Mark all as read</Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          {notifications.map((notification) => {
            const target = notification.eventId ? `/events/${notification.eventId}` : null;
            const { Icon, color } = TYPE_ICONS[notification.type];
            const content = (
              <>
                <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full ${color}`}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${notification.read ? "text-muted" : "font-medium"}`}>
                    {notification.message}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">{formatDateTime(notification.createdAt)}</span>
                </span>
                {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              </>
            );

            return (
              <li key={notification.id} className={notification.read ? "" : "bg-primary-soft/40"}>
                {target ? (
                  <Link
                    href={target}
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-muted"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-4 py-3.5">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
