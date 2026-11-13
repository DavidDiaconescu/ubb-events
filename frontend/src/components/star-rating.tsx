"use client";

import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5];

/** Read-only star display, e.g. for an average rating. */
export function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {STARS.map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`size-4 ${star <= Math.round(rating) ? "fill-accent text-accent" : "text-border"}`}
        />
      ))}
    </span>
  );
}

/** Interactive 1–5 star picker. */
export function StarInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="rounded transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Star
            aria-hidden="true"
            className={`size-8 ${star <= value ? "fill-accent text-accent" : "text-border"}`}
          />
        </button>
      ))}
    </div>
  );
}
