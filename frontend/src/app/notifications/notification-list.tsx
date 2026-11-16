"use client";

import { Bell } from "lucide-react";
import { SignInRequired } from "@/components/sign-in-required";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { markAllNotificationsAsRead } from "@/lib/actions";
import { useAppState, useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";
import { NotificationRow } from "./notification-row";

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
            <Button variant="secondary" size="sm" onClick={() => runAction(markAllNotificationsAsRead)}>Mark all as read</Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          {notifications.map((notification) => <NotificationRow key={notification.id} notification={notification} />)}
        </ul>
      )}
    </div>
  );
}
