"use client";

import { CategoryShortcuts } from "@/components/category-shortcuts";
import { EventList } from "@/components/event-list";
import { FeaturedEvent } from "@/components/featured-event";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { useNow } from "@/lib/hooks";
import { eventsOpenForRegistration } from "@/lib/queries";
import { useAppState } from "@/lib/store";

const MAX_SUGGESTIONS = 3;

/** The home page for visitors. */
export function Welcome() {
  const state = useAppState();
  const now = useNow();
  // The soonest open event is spotlighted; the next ones follow in the list.
  const [featuredEvent, ...otherOpenEvents] = eventsOpenForRegistration(state, now);
  const listedEvents = otherOpenEvents.slice(0, MAX_SUGGESTIONS);

  return (
    <div className="space-y-12">
      <HeroSlideshow title="Student events at UBB" />
      <CategoryShortcuts />
      {featuredEvent && <FeaturedEvent event={featuredEvent} />}
      {listedEvents.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Also open for registration</h2>
          <EventList events={listedEvents} />
        </section>
      )}
    </div>
  );
}
