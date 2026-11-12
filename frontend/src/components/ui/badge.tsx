import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "purple";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted",
  blue: "bg-primary-soft text-primary",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  purple: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
