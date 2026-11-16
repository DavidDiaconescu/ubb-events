"use client";

import {
  AlarmClock, ArrowUp, BadgeCheck, CircleCheck, CircleX, ListTodo, Megaphone, Pencil, ShieldCheck, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { markNotificationAsRead } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import { runAction } from "@/lib/toast";
import type { AppNotification, NotificationType } from "@/lib/types";

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

/** One notification; when it refers to an event, it links there and is marked as read on click. */
export function NotificationRow({ notification }: { notification: AppNotification }) {
  const { Icon, color } = TYPE_ICONS[notification.type];
  const content = (
    <>
      <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full ${color}`}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm ${notification.read ? "text-muted" : "font-medium"}`}>{notification.message}</span>
        <span className="mt-0.5 block text-xs text-muted">{formatDateTime(notification.createdAt)}</span>
      </span>
      {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
    </>
  );

  return (
    <li className={notification.read ? "" : "bg-primary-soft/40"}>
      {notification.eventId ? (
        <Link
          href={`/events/${notification.eventId}`}
          onClick={() => runAction(() => markNotificationAsRead(notification.id))}
          className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-muted"
        >
          {content}
        </Link>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3.5">{content}</div>
      )}
    </li>
  );
}
