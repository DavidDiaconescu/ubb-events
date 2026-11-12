"use client";

const STARS = [1, 2, 3, 4, 5];

/** Read-only star display, e.g. for an average rating. */
export function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-amber-500" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {STARS.map((star) => (
        <span key={star} aria-hidden="true" className={star <= Math.round(rating) ? "" : "opacity-25"}>
          ★
        </span>
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
          className={`text-3xl leading-none transition-transform hover:scale-110 ${
            star <= value ? "text-amber-500" : "text-border"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
