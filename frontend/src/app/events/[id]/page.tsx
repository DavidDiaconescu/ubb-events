import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { EventDetails } from "./event-details";

export const metadata: Metadata = { title: "Event details" };

export default function EventPage({ params }: PageProps<"/events/[id]">) {
  // With Cache Components, route params are request data and must be read inside Suspense.
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EventDetails params={params} />
    </Suspense>
  );
}
