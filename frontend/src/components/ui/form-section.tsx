import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "./card";

/** A card grouping related form fields under an icon and a title. */
export function FormSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <Card className="space-y-5">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </Card>
  );
}
