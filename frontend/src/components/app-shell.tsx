"use client";

import { University } from "lucide-react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { AccountMenu } from "@/components/layout/account-menu";
import { MainNavigation } from "@/components/layout/main-navigation";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import { Button } from "@/components/ui/button";
import { Notice, PageSkeleton } from "@/components/ui/feedback";
import { useIsClient } from "@/lib/hooks";
import { refreshState, useStoreStatus } from "@/lib/store";

/**
 * Header, navigation and page frame.
 * The page content is rendered only in the browser, after the data has been loaded from the
 * backend; until then (and on the server) a loading skeleton is shown.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const { loaded, error } = useStoreStatus();
  // After a failed load the pages are still shown (e.g. the sign-in page), below the error.
  const isReady = isClient && (loaded || error !== null);

  useEffect(() => {
    void refreshState();
  }, []);

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
          {isReady && <MainNavigation className="hidden h-full md:flex" />}
          <div className="ml-auto">{isReady && <AccountMenu />}</div>
        </div>
        {isReady && <MainNavigation className="flex h-11 border-t border-white/10 px-4 md:hidden" />}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {isClient && error && <LoadError message={error} />}
        {isReady ? children : <PageSkeleton />}
      </main>

      <SiteFooter />
      <Toaster />
    </>
  );
}

function LoadError({ message }: { message: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-start gap-3">
      <div className="min-w-0 flex-1">
        <Notice tone="danger" title="The data could not be loaded">{message}</Notice>
      </div>
      <Button variant="secondary" onClick={() => void refreshState()}>Try again</Button>
    </div>
  );
}
