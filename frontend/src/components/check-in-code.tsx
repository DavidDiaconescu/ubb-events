import { QrCode } from "lucide-react";

/** The participant's check-in code: large for the event page, compact for lists. */
export function CheckInCode({ code, compact = false }: { code: string | null; compact?: boolean }) {
  if (code === null) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2 py-1 font-mono text-sm">
        <QrCode className="size-4 text-muted" aria-hidden="true" />
        {code}
      </span>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-muted py-4 text-center">
      <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted">
        <QrCode className="size-4" aria-hidden="true" />
        Check-in code
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-wider">{code}</p>
    </div>
  );
}
