import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { EventBrowser } from "./event-browser";

export const metadata: Metadata = { title: "Discover events" };

export default function EventsPage() {
  // EventBrowser reads the search params (?category=), which are request data and must be read inside Suspense.
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EventBrowser />
    </Suspense>
  );
}
