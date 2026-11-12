import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";

/** Shown when a page's resource does not exist or the user is not allowed to see it. */
export function NotFoundMessage({ title, backHref, backLabel }: { title: string; backHref: string; backLabel: string }) {
  return (
    <EmptyState
      title={title}
      description="It may have been removed, or you may not have access to it."
      action={<ButtonLink href={backHref} variant="secondary" size="sm">{backLabel}</ButtonLink>}
    />
  );
}

/** Converts a route parameter to a positive integer id, or null if it is not one. */
export function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
