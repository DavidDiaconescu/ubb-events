interface CapacityMeterProps {
  confirmed: number;
  capacity: number;
  waitlisted?: number;
}

/** "12 / 40 places taken" with a progress bar; turns amber when almost full and red when full. */
export function CapacityMeter({ confirmed, capacity, waitlisted = 0 }: CapacityMeterProps) {
  const ratio = capacity > 0 ? Math.min(confirmed / capacity, 1) : 0;
  const isFull = confirmed >= capacity;
  const barColor = isFull ? "bg-danger" : ratio >= 0.8 ? "bg-warning" : "bg-success";

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs text-muted">
        <span>
          <span className="font-medium text-foreground">{confirmed}</span> / {capacity} places taken
        </span>
        {isFull ? (
          <span className="font-medium text-danger">
            Full{waitlisted > 0 ? ` · ${waitlisted} on waitlist` : ""}
          </span>
        ) : (
          <span>{capacity - confirmed} left</span>
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
