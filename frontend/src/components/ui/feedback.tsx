import { CircleCheck, CircleX, Inbox, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Large icon shown in a circle above the title. */
  icon?: LucideIcon;
}

/** Shown instead of a list when there is nothing to display. */
export function EmptyState({ title, description, action, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-10" aria-hidden="true" />
      </span>
      <p className="font-medium">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

type NoticeTone = "info" | "warning" | "danger" | "success";

const NOTICE_STYLES: Record<NoticeTone, { box: string; icon: string; Icon: LucideIcon }> = {
  info: { box: "border-primary/30 bg-primary-soft", icon: "text-primary", Icon: Info },
  warning: { box: "border-warning/30 bg-warning-soft", icon: "text-warning", Icon: TriangleAlert },
  danger: { box: "border-danger/30 bg-danger-soft", icon: "text-danger", Icon: CircleX },
  success: { box: "border-success/30 bg-success-soft", icon: "text-success", Icon: CircleCheck },
};

/** An inline message box. */
export function Notice({ tone = "info", title, children }: { tone?: NoticeTone; title?: string; children?: ReactNode }) {
  const { box, icon, Icon } = NOTICE_STYLES[tone];
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 text-sm text-foreground ${box}`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${icon}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {/* foreground/80 instead of muted: muted on the *-soft backgrounds is below 4.5:1. */}
        {children && <div className={title ? "mt-1 text-foreground/80" : ""}>{children}</div>}
      </div>
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
