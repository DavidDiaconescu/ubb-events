"use client";

import {
  Bell,
  Building2,
  CalendarCheck,
  Compass,
  Info,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "@/components/toaster";
import { ButtonLink } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/feedback";
import { fullName, initials } from "@/lib/format";
import { useIsClient } from "@/lib/hooks";
import { resetDemoData, signOut } from "@/lib/mock-api";
import { describeRole, hasOrganizerAccess, isAdmin } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";
import { showToast } from "@/lib/toast";

/**
 * Header, navigation and page frame.
 * The page content is rendered only in the browser, because it reads the mock data from
 * localStorage and depends on the current time; the server sends a loading skeleton.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const isClient = useIsClient();

  return (
    <>
      <DemoBanner showReset={isClient} />
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">UE</span>
            <span>UBB Events</span>
          </Link>
          {isClient && <MainNavigation className="hidden h-full md:flex" />}
          <div className="ml-auto">{isClient && <AccountArea />}</div>
        </div>
        {isClient && <MainNavigation className="flex h-11 border-t border-border px-4 md:hidden" />}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {isClient ? children : <PageSkeleton />}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        UBB Events · Event management for UBB student organizations
      </footer>
      <Toaster />
    </>
  );
}

function DemoBanner({ showReset }: { showReset: boolean }) {
  function handleReset() {
    resetDemoData();
    showToast("The demo data was restored.");
  }

  return (
    <div className="border-b border-border bg-surface-muted px-4 py-1.5 text-center text-xs text-muted">
      <Info className="mr-1.5 inline size-4 align-[-3px]" aria-hidden="true" />
      Demo mode: the app uses mock data and is not connected to the backend yet.
      {showReset && (
        <button
          type="button"
          onClick={handleReset}
          className="ml-2 font-medium text-foreground underline underline-offset-2 hover:text-primary"
        >
          Reset demo data
        </button>
      )}
    </div>
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
            className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
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
        className="relative grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
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
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg p-1 hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
          <span className="grid size-8 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {initials(user)}
          </span>
          <span className="hidden max-w-40 truncate text-sm font-medium sm:block">{fullName(user)}</span>
        </summary>
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-lg">
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
