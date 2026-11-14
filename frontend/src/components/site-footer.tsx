"use client";

import { ArrowUp, University } from "lucide-react";
import Link from "next/link";
import { useIsClient } from "@/lib/hooks";

/** Navy footer: brand and tagline on top, copyright and "back to top" in the bottom bar. */
export function SiteFooter() {
  // The year is read only in the browser: with Cache Components, the current time can't be used while prerendering.
  const isClient = useIsClient();
  const year = isClient ? new Date().getFullYear() : null;

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <footer className="mt-8 bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-2.5 font-semibold">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-navy shadow-sm transition-transform group-hover:-rotate-6">
            <University className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl tracking-tight">UBB Events</span>
        </Link>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
          The platform for discovering, joining and organizing student events at Babeș-Bolyai University —
          workshops, conferences, trainings and more, all in one place.
        </p>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/60 sm:flex-row sm:px-6">
          <p>
            © {year} UBB Events · Babeș-Bolyai University, Cluj-Napoca
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            Back to top
            <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
