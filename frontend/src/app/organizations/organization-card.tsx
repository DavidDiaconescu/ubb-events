"use client";

import { ArrowRight, CalendarDays, Mail, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { MembershipButton } from "@/components/membership-button";
import { Badge } from "@/components/ui/badge";
import { isActiveMember } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";
import type { Organization } from "@/lib/types";
import { OrganizationBanner } from "./organization-banner";

const ACTIVE_EVENT_STATUSES = ["PUBLISHED", "REGISTRATION_CLOSED", "ONGOING"];

/** A card for one organization: banner, description, member and event counts, and the join button. */
export function OrganizationCard({ organization }: { organization: Organization }) {
  const state = useAppState();
  const user = useCurrentUser();

  const memberCount = state.memberships.filter((m) => m.organizationId === organization.id && m.active).length;
  const activeEventCount = state.events.filter(
    (event) => event.organizationId === organization.id && ACTIVE_EVENT_STATUSES.includes(event.status),
  ).length;
  const isMember = user !== null && isActiveMember(state, user.id, organization.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <OrganizationBanner organization={organization} />

      <div className="absolute right-4 top-4 flex gap-1.5">
        {organization.status === "SUSPENDED" && <Badge tone="red">Suspended</Badge>}
        {isMember && <Badge tone="green">Member</Badge>}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-11">
        <h2 className="text-lg font-semibold tracking-tight">
          {/* The link covers the whole card; the membership button sits above it. */}
          <Link
            href={`/organizations/${organization.id}`}
            className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary group-hover:text-primary"
          >
            {organization.name}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{organization.description}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          <CountTile icon={Users} label="Members" value={memberCount} />
          <CountTile icon={CalendarDays} label="Active events" value={activeEventCount} />
        </dl>

        <p className="mb-5 mt-4 flex min-w-0 items-center gap-1.5 text-xs text-muted">
          <Mail className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{organization.contactEmail}</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            View organization
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </span>
          <div className="relative z-10">
            <MembershipButton organization={organization} />
          </div>
        </div>
      </div>
    </article>
  );
}

function CountTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface-muted px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-0.5 text-xl font-bold">{value}</dd>
    </div>
  );
}
