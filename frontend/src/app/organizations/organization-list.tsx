"use client";

import { ArrowRight, CalendarDays, Mail, Users } from "lucide-react";
import Link from "next/link";
import { MembershipButton } from "@/components/membership-button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { isActiveMember } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";

/** Banner gradients in the navy family; each organization gets one by id so cards stay distinguishable. */
const BANNER_GRADIENTS = [
  "from-navy to-[#2f5d8a]",
  "from-[#123a4a] to-[#2c7a7b]",
  "from-[#1f2a5c] to-[#5b5fa8]",
  "from-[#1b2b44] to-[#4a6a8f]",
];

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => {
          const memberCount = state.memberships.filter(
            (membership) => membership.organizationId === organization.id && membership.active,
          ).length;
          const activeEventCount = state.events.filter(
            (event) =>
              event.organizationId === organization.id &&
              ["PUBLISHED", "REGISTRATION_CLOSED", "ONGOING"].includes(event.status),
          ).length;
          const isSuspended = organization.status === "SUSPENDED";
          const isMember = user !== null && isActiveMember(state, user.id, organization.id);
          const gradient = BANNER_GRADIENTS[organization.id % BANNER_GRADIENTS.length];

          return (
            <article
              key={organization.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Banner with a large faded initial as decoration */}
              <div
                className={`relative h-24 overflow-hidden bg-gradient-to-br ${gradient} ${isSuspended ? "grayscale" : ""}`}
                aria-hidden="true"
              >
                <span className="absolute -right-3 -top-8 select-none text-[9rem] font-black leading-none text-white/10 transition-transform duration-500 group-hover:scale-110">
                  {organization.name.charAt(0)}
                </span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.18),transparent_55%)]" />
              </div>

              {/* Avatar overlapping the banner */}
              <span
                className={`absolute left-5 top-14 grid size-16 place-items-center rounded-2xl border-4 border-surface bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-md ${isSuspended ? "grayscale" : ""}`}
                aria-hidden="true"
              >
                {organization.name.charAt(0)}
              </span>

              <div className="absolute right-4 top-4 flex gap-1.5">
                {isSuspended && <Badge tone="red">Suspended</Badge>}
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
                  <div className="rounded-2xl bg-surface-muted px-3 py-2.5">
                    <dt className="flex items-center gap-1.5 text-xs text-muted">
                      <Users className="size-3.5" aria-hidden="true" />
                      Members
                    </dt>
                    <dd className="mt-0.5 text-xl font-bold">{memberCount}</dd>
                  </div>
                  <div className="rounded-2xl bg-surface-muted px-3 py-2.5">
                    <dt className="flex items-center gap-1.5 text-xs text-muted">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      Active events
                    </dt>
                    <dd className="mt-0.5 text-xl font-bold">{activeEventCount}</dd>
                  </div>
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
        })}
      </div>
    </div>
  );
}
