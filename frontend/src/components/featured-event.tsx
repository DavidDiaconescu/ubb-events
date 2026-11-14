"use client";

import { ArrowRight, Clock, MapPin, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CapacityMeter } from "@/components/capacity-meter";
import { CategoryBadge } from "@/components/status-badges";
import { categoryPhotoUrl } from "@/lib/event-photos";
import { formatEventTime } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { countRegistrations, countTakenPlaces, organizationName, venueLabel } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/** "Starts in 3 days", "Starts in 5 hours", "Starts in 20 minutes" or "Happening now". */
function countdownLabel(startTime: string, now: number): string {
  const remaining = Date.parse(startTime) - now;
  if (remaining <= 0) return "Happening now";
  const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? "" : "s"}`;
  if (remaining >= DAY_MS) return `Starts in ${plural(Math.floor(remaining / DAY_MS), "day")}`;
  if (remaining >= HOUR_MS) return `Starts in ${plural(Math.floor(remaining / HOUR_MS), "hour")}`;
  return `Starts in ${plural(Math.max(1, Math.floor(remaining / 60_000)), "minute")}`;
}

/** Large spotlight card for one event: photo on one side, the key facts and a call to action on the other. */
export function FeaturedEvent({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const now = useNow();
  const confirmed = countTakenPlaces(state, event.id);
  const waitlisted = countRegistrations(state, event.id, "WAITLISTED");

  return (
    <section aria-labelledby="featured-heading">
      <h2 id="featured-heading" className="mb-4 text-lg font-semibold">
        Coming up next
      </h2>
      <Link
        href={`/events/${event.id}`}
        className="group grid overflow-hidden rounded-3xl border border-border bg-surface shadow-md transition-shadow duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:grid-cols-5"
      >
        <div className="relative min-h-56 overflow-hidden md:col-span-2 md:min-h-full">
          {/* Photo and navy overlay zoom together, clipped to this column. */}
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none">
            <Image
              src={categoryPhotoUrl(event.category, 1200)}
              alt=""
              fill
              sizes="(min-width: 768px) 440px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" aria-hidden="true" />
          </div>
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-navy shadow">
            <Timer className="size-4" aria-hidden="true" />
            {countdownLabel(event.startTime, now)}
          </span>
        </div>

        <div className="flex flex-col p-6 sm:p-8 md:col-span-3">
          <div>
            <CategoryBadge category={event.category} />
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
            {event.title}
          </h3>
          <p className="mt-1 font-medium text-muted">{organizationName(state, event.organizationId)}</p>
          <p className="mt-4 line-clamp-3 text-foreground/80">{event.description}</p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              {formatEventTime(event.startTime, event.endTime)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {venueLabel(state, event.venueId)}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between md:mt-auto md:pt-6">
            <div className="sm:w-64">
              <CapacityMeter confirmed={confirmed} capacity={event.capacity} waitlisted={waitlisted} />
            </div>
            <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary-hover">
              View details and register
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
