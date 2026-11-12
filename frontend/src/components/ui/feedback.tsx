import type { ReactNode } from "react";

/** Shown instead of a list when there is nothing to display. */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

type NoticeTone = "info" | "warning" | "danger" | "success";

const NOTICE_CLASSES: Record<NoticeTone, string> = {
  info: "border-primary/30 bg-primary-soft text-foreground",
  warning: "border-warning/30 bg-warning-soft text-foreground",
  danger: "border-danger/30 bg-danger-soft text-foreground",
  success: "border-success/30 bg-success-soft text-foreground",
};

/** An inline message box. */
export function Notice({ tone = "info", title, children }: { tone?: NoticeTone; title?: string; children?: ReactNode }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${NOTICE_CLASSES[tone]}`}>
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={title ? "mt-1 text-muted" : ""}>{children}</div>}
    </div>
  );
}

/** Placeholder blocks shown while a page is loading. */
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div className="h-8 w-64 rounded-lg bg-surface-muted" />
      <div className="h-4 w-96 max-w-full rounded bg-surface-muted" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-40 rounded-xl bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
