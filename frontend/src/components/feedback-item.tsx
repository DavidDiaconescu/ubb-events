"use client";

import { StarDisplay } from "@/components/star-rating";
import { formatDate } from "@/lib/format";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import type { Feedback } from "@/lib/types";

/** One participant review: stars, author (or "Anonymous"), date and comment. */
export function FeedbackItem({ feedback, className = "" }: { feedback: Feedback; className?: string }) {
  const state = useAppState();
  const author = feedback.userId === null ? "Anonymous" : userDisplayName(state, feedback.userId);

  return (
    <li className={`text-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <StarDisplay rating={feedback.rating} />
        <span className="text-xs text-muted">{author} · {formatDate(feedback.submittedAt)}</span>
      </div>
      {feedback.comment && <p className="mt-1">{feedback.comment}</p>}
    </li>
  );
}

/** The average rating in large type, with stars and a caption such as "4 reviews". */
export function RatingSummary({ average, caption, large = false }: { average: number; caption: string; large?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${large ? "text-4xl" : "text-3xl"} font-semibold`}>{average.toFixed(1)}</span>
      <div>
        <StarDisplay rating={average} />
        <p className="text-xs text-muted">{caption}</p>
      </div>
    </div>
  );
}
