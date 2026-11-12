import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-surface p-5 ${className}`}>{children}</div>;
}

interface CardSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A card with a heading row, used for the sections of most pages. */
export function CardSection({ title, description, action, children, className = "" }: CardSectionProps) {
  return (
    <Card className={className}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
