"use client";

import Link from "next/link";
import { CardSection } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { useAppState } from "@/lib/store";
import type { User } from "@/lib/types";

const PREVIEW_SIZE = 3;

/** The newest unread notifications. */
export function NotificationsPreview({ user }: { user: User }) {
  const state = useAppState();
  const unread = state.notifications
    .filter((notification) => notification.recipientId === user.id && !notification.read)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <CardSection title="Notifications" action={<Link href="/notifications" className="text-sm font-medium text-primary">Open</Link>}>
      {unread.length === 0 ? (
        <p className="text-sm text-muted">You are all caught up.</p>
      ) : (
        <ul className="space-y-3">
          {unread.slice(0, PREVIEW_SIZE).map((notification) => (
            <li key={notification.id} className="text-sm">
              <p>{notification.message}</p>
              <p className="mt-0.5 text-xs text-muted">{formatDateTime(notification.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </CardSection>
  );
}
