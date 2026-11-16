"use client";

import { useState, type FormEvent } from "react";
import { StarInput } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Textarea } from "@/components/ui/form";
import { submitFeedback } from "@/lib/actions";
import { runAction } from "@/lib/toast";

const MAX_COMMENT_LENGTH = 255;

export function FeedbackForm({ eventId }: { eventId: number }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (await runAction(() => submitFeedback(eventId, { rating, comment, anonymous }), "Thank you for your feedback!")) {
      setSubmitted(true);
    }
  }

  if (submitted) return <p className="text-sm text-muted">Thank you, your feedback was recorded.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-1.5 text-sm font-medium">How was the event?</p>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <Field label="Comment (optional)" htmlFor="feedback-comment" hint={`${comment.length}/${MAX_COMMENT_LENGTH} characters`}>
        <Textarea
          id="feedback-comment"
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you like? What could be improved?"
        />
      </Field>
      <Checkbox
        label="Submit anonymously"
        checked={anonymous}
        onChange={(event) => setAnonymous(event.target.checked)}
      />
      <Button type="submit" disabled={rating === 0} className="w-full">Send feedback</Button>
    </form>
  );
}
