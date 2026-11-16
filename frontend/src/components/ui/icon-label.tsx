import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** A small icon followed by text, e.g. a clock and the event time. */
export function IconLabel({ icon: Icon, children, className = "" }: { icon: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
}
