import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { EditEvent } from "./edit-event";

export const metadata: Metadata = { title: "Edit event" };

export default function EditEventPage({ params }: PageProps<"/manage/events/[id]/edit">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditEvent params={params} />
    </Suspense>
  );
}
