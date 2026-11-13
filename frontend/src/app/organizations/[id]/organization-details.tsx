"use client";

import { CalendarDays } from "lucide-react";
import { use } from "react";
import { EventCard } from "@/components/event-card";
import { MembershipButton } from "@/components/membership-button";
import { NotFoundMessage, parseId } from "@/components/not-found-message";
import { Badge } from "@/components/ui/badge";
import { CardSection } from "@/components/ui/card";
import { EmptyState, Notice } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { fullName, initials } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { ORG_ROLE_LABELS } from "@/lib/labels";
import { isVisibleToParticipants } from "@/lib/permissions";
import { sortByStartTime } from "@/lib/queries";
import { useAppState } from "@/lib/store";

export function OrganizationDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useAppState();
  const now = useNow();

  const organizationId = parseId(id);
  const organization = state.organizations.find((item) => item.id === organizationId);
  if (!organization) {
    return <NotFoundMessage title="Organization not found" backHref="/organizations" backLabel="All organizations" />;
  }

  const members = state.memberships
    .filter((membership) => membership.organizationId === organization.id && membership.active)
    .flatMap((membership) => {
      const user = state.users.find((item) => item.id === membership.userId);
      return user ? [{ membership, user }] : [];
    })
    // Coordinators first, then alphabetically.
    .sort((a, b) =>
      a.membership.role === b.membership.role
        ? a.user.lastName.localeCompare(b.user.lastName)
        : a.membership.role === "COORDINATOR" ? -1 : 1);

  const upcomingEvents = sortByStartTime(
    state.events.filter(
      (event) =>
        event.organizationId === organization.id &&
        isVisibleToParticipants(event) &&
        event.status !== "CANCELLED" &&
        Date.parse(event.endTime) >= now,
    ),
  );

  return (
    <div>
      <PageHeader
        backLink={{ href: "/organizations", label: "All organizations" }}
        title={organization.name}
        description={<a href={`mailto:${organization.contactEmail}`} className="hover:underline">{organization.contactEmail}</a>}
        actions={<MembershipButton organization={organization} />}
      />

      {organization.status === "SUSPENDED" && (
        <div className="mb-6">
          <Notice tone="danger" title="This organization is suspended">
            It cannot accept new members or create events until an administrator reactivates it.
          </Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardSection title="About">
            <p className="leading-relaxed">{organization.description}</p>
          </CardSection>

          <section>
            <h2 className="mb-4 text-base font-semibold">Upcoming events</h2>
            {upcomingEvents.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No upcoming events" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </div>

        <CardSection title="Members" description={`${members.length} active`} className="self-start">
          <ul className="space-y-2.5">
            {members.map(({ membership, user }) => (
              <li key={membership.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {initials(user)}
                  </span>
                  <span className="truncate">{fullName(user)}</span>
                </span>
                {membership.role === "COORDINATOR" && <Badge tone="blue">{ORG_ROLE_LABELS.COORDINATOR}</Badge>}
              </li>
            ))}
          </ul>
        </CardSection>
      </div>
    </div>
  );
}
