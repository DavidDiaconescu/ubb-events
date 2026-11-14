import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted",
  blue: "bg-primary-soft text-primary",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger-foreground",
  purple: "bg-info-soft text-info",
};

interface BadgeProps {
  tone?: BadgeTone;
  /** Shows a small dot in the badge colour before the text; used for statuses. */
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ tone = "neutral", dot = false, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {dot && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
