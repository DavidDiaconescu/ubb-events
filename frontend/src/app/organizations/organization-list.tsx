"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useAppState } from "@/lib/store";
import { OrganizationCard } from "./organization-card";

export function OrganizationList() {
  const state = useAppState();
  const organizations = [...state.organizations].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Student organizations at UBB. Join one to take part in its members-only events."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => <OrganizationCard key={organization.id} organization={organization} />)}
      </div>
    </div>
  );
}
