import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { ManageEvent } from "./manage-event";

export const metadata: Metadata = { title: "Manage event" };

export default function ManageEventPage({ params }: PageProps<"/manage/events/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ManageEvent params={params} />
    </Suspense>
  );
}
