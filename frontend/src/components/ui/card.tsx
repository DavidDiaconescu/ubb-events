import type { ReactNode } from "react";

/** Base look of every card: white, bordered, rounded, with a very subtle shadow. */
export const CARD_CLASSES = "rounded-xl border border-border bg-surface shadow-sm";

/** Extra classes for clickable cards (links): the border turns blue and the shadow grows on hover. */
export const INTERACTIVE_CARD_CLASSES =
  "transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${CARD_CLASSES} p-5 ${className}`}>{children}</div>;
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
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
