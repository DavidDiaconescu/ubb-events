"use client";

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
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">UE</span>
            <span>UBB Events</span>
          </Link>
          {isClient && <MainNavigation className="hidden md:flex" />}
          <div className="ml-auto">{isClient && <AccountArea />}</div>
        </div>
        {isClient && <MainNavigation className="flex border-t border-border px-4 md:hidden" />}
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
    <div className="bg-warning-soft px-4 py-1.5 text-center text-xs text-warning">
      Demo mode: the app uses mock data and is not connected to the backend yet.
      {showReset && (
        <button type="button" onClick={handleReset} className="ml-2 font-medium underline underline-offset-2">
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
    { href: "/events", label: "Discover", visible: true },
    { href: "/my-events", label: "My events", visible: user !== null },
    { href: "/organizations", label: "Organizations", visible: true },
    { href: "/manage", label: "Manage", visible: hasOrganizerAccess(state, user) },
    { href: "/admin", label: "Admin", visible: isAdmin(user) },
  ].filter((link) => link.visible);

  return (
    <nav aria-label="Main" className={`gap-1 overflow-x-auto ${className}`}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
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
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white dark:text-background">
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
          <Link href="/login" className="mt-1 block rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
            Switch demo account
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface-muted"
          >
            Sign out
          </button>
        </div>
      </details>
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
