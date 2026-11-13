"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { MembershipButton } from "@/components/membership-button";
import { Badge } from "@/components/ui/badge";
import { CARD_CLASSES } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { isActiveMember } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";

export function OrganizationList() {
  const state = useAppState();
  const user = useCurrentUser();

  const organizations = [...state.organizations].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Student organizations at UBB. Join one to take part in its members-only events."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {organizations.map((organization) => {
          const memberCount = state.memberships.filter(
            (membership) => membership.organizationId === organization.id && membership.active,
          ).length;
          const upcomingEventCount = state.events.filter(
            (event) =>
              event.organizationId === organization.id &&
              ["PUBLISHED", "REGISTRATION_CLOSED", "ONGOING"].includes(event.status),
          ).length;

          return (
            <article
              key={organization.id}
              className={`flex flex-col p-5 ${CARD_CLASSES} transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-lg font-semibold text-primary">
                  {organization.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/organizations/${organization.id}`} className="font-semibold hover:text-primary">
                      {organization.name}
                    </Link>
                    {organization.status === "SUSPENDED" && <Badge tone="red">Suspended</Badge>}
                    {user && isActiveMember(state, user.id, organization.id) && <Badge tone="green">Member</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{organization.description}</p>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 shrink-0" aria-hidden="true" />
                  {memberCount} {memberCount === 1 ? "member" : "members"} · {upcomingEventCount} active{" "}
                  {upcomingEventCount === 1 ? "event" : "events"}
                </span>
                <MembershipButton organization={organization} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
