"use client";

import type { ReactNode } from "react";
import { formatDateTime } from "@/lib/format";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { Announcement } from "@/lib/types";

interface AnnouncementItemProps {
  announcement: Announcement;
  /** Shown next to the title, e.g. the audience badge for organizers. */
  badge?: ReactNode;
  className?: string;
}

/** An announcement from the organizers: title, message, author and time. */
export function AnnouncementItem({ announcement, badge, className = "rounded-lg bg-surface-muted p-4" }: AnnouncementItemProps) {
  const state = useAppState();

  return (
    <li className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{announcement.title}</p>
        {badge}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm">{announcement.content}</p>
      <p className="mt-2 text-xs text-muted">
        {userDisplayName(state, announcement.authorId)} · {formatDateTime(announcement.sentAt)}
      </p>
    </li>
  );
}
