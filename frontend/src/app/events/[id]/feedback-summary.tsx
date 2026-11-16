"use client";

import { FeedbackItem, RatingSummary } from "@/components/feedback-item";
import { CardSection } from "@/components/ui/card";
import { averageRating } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

/** The average rating and the reviews with a comment, once the event has finished. */
export function FeedbackSummary({ event }: { event: UbbEvent }) {
  const state = useAppState();
  if (event.status !== "FINISHED" && event.status !== "ARCHIVED") return null;

  const { average, count } = averageRating(state, event.id);
  const withComments = state.feedback
    .filter((item) => item.eventId === event.id && item.comment)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <CardSection title="Participant feedback">
      {count === 0 ? (
        <p className="text-sm text-muted">No feedback has been submitted yet.</p>
      ) : (
        <>
          <RatingSummary average={average} caption={`${count} ${count === 1 ? "review" : "reviews"}`} />
          <ul className="mt-5 space-y-4 border-t border-border pt-5">
            {withComments.map((item) => <FeedbackItem key={item.id} feedback={item} />)}
          </ul>
        </>
      )}
    </CardSection>
  );
}
