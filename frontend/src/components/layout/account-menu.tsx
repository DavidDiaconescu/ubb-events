"use client";

import { Bell, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { signOut } from "@/lib/actions";
import { fullName } from "@/lib/format";
import { describeRole } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";

/** "Sign in" for visitors; the notification bell and the account dropdown for signed-in users. */
export function AccountMenu() {
  const router = useRouter();
  const state = useAppState();
  const user = useCurrentUser();

  if (user === null) {
    return <ButtonLink href="/login" size="sm">Sign in</ButtonLink>;
  }

  const unreadCount = state.notifications.filter(
    (notification) => notification.recipientId === user.id && !notification.read,
  ).length;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/notifications"
        className="relative grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </Link>

      <Dropdown
        triggerClassName="flex items-center gap-2 rounded-lg p-1 hover:bg-white/10"
        panelClassName="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-2 text-foreground shadow-lg"
        trigger={
          <>
            <Avatar user={user} className="bg-white text-navy" />
            <span className="hidden max-w-40 truncate text-sm font-medium sm:block">{fullName(user)}</span>
          </>
        }
      >
          <div className="border-b border-border px-3 pb-3 pt-1">
            <p className="truncate text-sm font-medium">{fullName(user)}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-primary">{describeRole(state, user)}</p>
          </div>
          <Link href="/login" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
            <UserRound className="size-4 text-muted" aria-hidden="true" />
            Switch account
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface-muted"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
      </Dropdown>
    </div>
  );
}
