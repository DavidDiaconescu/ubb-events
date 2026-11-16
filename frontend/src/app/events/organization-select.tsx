import { Building2, ChevronDown } from "lucide-react";
import type { Organization } from "@/lib/types";

interface OrganizationSelectProps {
  organizations: Organization[];
  value: string;
  onChange: (organizationId: string) => void;
}

/** Organization filter, styled for the navy filter panel. */
export function OrganizationSelect({ organizations, value, onChange }: OrganizationSelectProps) {
  return (
    <label className="relative block lg:w-60">
      <span className="sr-only">Organization</span>
      <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/70" aria-hidden="true" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-white/20 bg-white/10 pl-9 pr-9 text-sm text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <option value="" className="text-foreground">All organizations</option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id} className="text-foreground">{organization.name}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/70" aria-hidden="true" />
    </label>
  );
}
