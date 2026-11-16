"use client";

import { MessageSquare, Star } from "lucide-react";
import { FeedbackItem, RatingSummary } from "@/components/feedback-item";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { averageRating, countRegistrations } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { Feedback, UbbEvent } from "@/lib/types";

const STARS_DESCENDING = [5, 4, 3, 2, 1];

export function FeedbackTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const feedback = state.feedback
    .filter((item) => item.eventId === event.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  if (event.status !== "FINISHED" && event.status !== "ARCHIVED") {
    return <EmptyState icon={MessageSquare} title="Feedback opens after the event" description="Participants who checked in can rate the event once it is marked as finished." />;
  }
  if (feedback.length === 0) {
    return <EmptyState icon={Star} title="No feedback yet" />;
  }

  const { average, count } = averageRating(state, event.id);
  const attendedCount = countRegistrations(state, event.id, "ATTENDED");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <CardSection title="Summary" className="self-start">
        <RatingSummary average={average} caption={`${count} of ${attendedCount} participants responded`} large />
        <RatingDistribution feedback={feedback} />
      </CardSection>

      <CardSection title="Responses" className="lg:col-span-2">
        <ul className="divide-y divide-border">
          {feedback.map((item) => <FeedbackItem key={item.id} feedback={item} className="py-3" />)}
        </ul>
      </CardSection>
    </div>
  );
}

/** One bar per star value, as long as the share of responses with that rating. */
function RatingDistribution({ feedback }: { feedback: Feedback[] }) {
  return (
    <ul className="mt-5 space-y-1.5">
      {STARS_DESCENDING.map((stars) => {
        const ratingCount = feedback.filter((item) => item.rating === stars).length;
        return (
          <li key={stars} className="flex items-center gap-2 text-xs">
            <span className="inline-flex w-8 items-center gap-0.5 text-muted">
              {stars}
              <Star className="size-3 fill-accent text-accent" aria-label="stars" />
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <span className="block h-full rounded-full bg-accent" style={{ width: `${(ratingCount / feedback.length) * 100}%` }} />
            </span>
            <span className="w-4 text-right tabular-nums text-muted">{ratingCount}</span>
          </li>
        );
      })}
    </ul>
  );
}
