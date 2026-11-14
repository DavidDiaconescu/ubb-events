"use client";

import { MessageSquare, Star } from "lucide-react";
import { StarDisplay } from "@/components/star-rating";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/format";
import { averageRating, countRegistrations, userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { UbbEvent } from "@/lib/types";

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
        <div className="flex items-center gap-3">
          <span className="text-4xl font-semibold">{average.toFixed(1)}</span>
          <div>
            <StarDisplay rating={average} />
            <p className="text-xs text-muted">{count} of {attendedCount} participants responded</p>
          </div>
        </div>
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
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${(ratingCount / count) * 100}%` }} />
                </span>
                <span className="w-4 text-right tabular-nums text-muted">{ratingCount}</span>
              </li>
            );
          })}
        </ul>
      </CardSection>

      <CardSection title="Responses" className="lg:col-span-2">
        <ul className="divide-y divide-border">
          {feedback.map((item) => (
            <li key={item.id} className="py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StarDisplay rating={item.rating} />
                <span className="text-xs text-muted">
                  {item.anonymous ? "Anonymous" : userDisplayName(state, item.userId)} · {formatDate(item.submittedAt)}
                </span>
              </div>
              {item.comment && <p className="mt-1">{item.comment}</p>}
            </li>
          ))}
        </ul>
      </CardSection>
    </div>
  );
}
