import { Flame, Hourglass, Users } from "lucide-react";

interface CapacityMeterProps {
  confirmed: number;
  capacity: number;
  waitlisted?: number;
}

/** Below this share of free places the meter switches to the accent colour. */
const FEW_PLACES_LEFT = 0.2;

/** "12 / 40 places taken" with a progress bar: blue, orange when under 20% of places are left, red when full. */
export function CapacityMeter({ confirmed, capacity, waitlisted = 0 }: CapacityMeterProps) {
  const ratio = capacity > 0 ? Math.min(confirmed / capacity, 1) : 0;
  const isFull = confirmed >= capacity;
  const isAlmostFull = !isFull && (capacity - confirmed) / capacity < FEW_PLACES_LEFT;
  const barColor = isFull ? "bg-danger" : isAlmostFull ? "bg-accent" : "bg-primary";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium text-foreground">{confirmed}</span> / {capacity} places taken
          </span>
        </span>
        {isFull ? (
          <span className="inline-flex items-center gap-1 font-medium text-danger">
            {waitlisted > 0 && <Hourglass className="size-4 shrink-0" aria-hidden="true" />}
            Full{waitlisted > 0 ? ` · ${waitlisted} on waitlist` : ""}
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1 ${isAlmostFull ? "font-medium text-accent-foreground" : ""}`}>
            {isAlmostFull && <Flame className="size-4 shrink-0 text-accent" aria-hidden="true" />}
            {capacity - confirmed} left
          </span>
        )}
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={confirmed}
        aria-label="Places taken"
      >
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
