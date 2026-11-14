"use client";

import {
  Bell,
  Building2,
  CalendarCheck,
  Compass,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  University,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import { ButtonLink } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/feedback";
import { fullName, initials } from "@/lib/format";
import { useIsClient } from "@/lib/hooks";
import { signOut } from "@/lib/mock-api";
import { describeRole, hasOrganizerAccess, isAdmin } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";

/**
 * Header, navigation and page frame.
 * The page content is rendered only in the browser, because it reads the mock data from
 * localStorage and depends on the current time; the server sends a loading skeleton.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const isClient = useIsClient();

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-navy shadow-sm transition-transform group-hover:-rotate-6">
              <University className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg tracking-tight">UBB Events</span>
          </Link>
          {isClient && <MainNavigation className="hidden h-full md:flex" />}
          <div className="ml-auto">{isClient && <AccountArea />}</div>
        </div>
        {isClient && <MainNavigation className="flex h-11 border-t border-white/10 px-4 md:hidden" />}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {isClient ? children : <PageSkeleton />}
      </main>

      <SiteFooter />
      <Toaster />
    </>
  );
}

function MainNavigation({ className }: { className: string }) {
  const pathname = usePathname();
  const state = useAppState();
  const user = useCurrentUser();

  const links = [
    { href: "/events", label: "Discover", icon: Compass, visible: true },
    { href: "/my-events", label: "My events", icon: CalendarCheck, visible: user !== null },
    { href: "/organizations", label: "Organizations", icon: Building2, visible: true },
    { href: "/manage", label: "Manage", icon: LayoutDashboard, visible: hasOrganizerAccess(state, user) },
    { href: "/admin", label: "Admin", icon: ShieldCheck, visible: isAdmin(user) },
  ].filter((link) => link.visible);

  return (
    <nav aria-label="Main" className={`items-stretch gap-1 overflow-x-auto ${className}`}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
              isActive
                ? "border-white text-white"
                : "border-transparent text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            <link.icon className="size-5" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountArea() {
  const router = useRouter();
  const state = useAppState();
  const user = useCurrentUser();

  if (user === null) {
    return <ButtonLink href="/login" size="sm">Sign in</ButtonLink>;
  }

  const unreadCount = state.notifications.filter(
    (notification) => notification.recipientId === user.id && !notification.read,
  ).length;

  function handleSignOut() {
    signOut();
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

      <details className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg p-1 hover:bg-white/10 [&::-webkit-details-marker]:hidden">
          <span className="grid size-8 place-items-center rounded-full bg-white text-xs font-semibold text-navy">
            {initials(user)}
          </span>
          <span className="hidden max-w-40 truncate text-sm font-medium sm:block">{fullName(user)}</span>
        </summary>
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-2 text-foreground shadow-lg">
          <div className="border-b border-border px-3 pb-3 pt-1">
            <p className="truncate text-sm font-medium">{fullName(user)}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-primary">{describeRole(state, user)}</p>
          </div>
          <Link href="/login" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
            <UserRound className="size-4 text-muted" aria-hidden="true" />
            Switch demo account
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface-muted"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </details>
    </div>
  );
}
