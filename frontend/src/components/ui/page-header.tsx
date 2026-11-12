import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  backLink?: { href: string; label: string };
}

export function PageHeader({ title, description, actions, backLink }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {backLink && (
        <Link href={backLink.href} className="mb-3 inline-block text-sm text-muted hover:text-foreground">
          ← {backLink.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description && <div className="mt-1.5 text-muted">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
