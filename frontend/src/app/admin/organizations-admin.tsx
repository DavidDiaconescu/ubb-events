"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { setOrganizationStatus } from "@/lib/actions";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";

/** Suspend or reactivate organizations. */
export function OrganizationsAdmin() {
  const state = useAppState();

  return (
    <CardSection title="Organizations" description="Suspended organizations cannot create events or accept new members.">
      <ul className="divide-y divide-border">
        {state.organizations.map((organization) => {
          const isActive = organization.status === "ACTIVE";
          return (
            <li key={organization.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2">
                <Link href={`/organizations/${organization.id}`} className="font-medium hover:text-primary">{organization.name}</Link>
                <Badge tone={isActive ? "green" : "red"}>{isActive ? "Active" : "Suspended"}</Badge>
              </div>
              <Button
                size="sm"
                variant={isActive ? "secondary" : "primary"}
                onClick={() =>
                  runAction(
                    () => setOrganizationStatus(organization.id, isActive ? "SUSPENDED" : "ACTIVE"),
                    `${organization.name} was ${isActive ? "suspended" : "reactivated"}.`,
                  )
                }
              >
                {isActive ? "Suspend" : "Reactivate"}
              </Button>
            </li>
          );
        })}
      </ul>
    </CardSection>
  );
}
