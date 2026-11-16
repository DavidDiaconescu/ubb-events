"use client";

import { CalendarDays } from "lucide-react";
import { use } from "react";
import { EventList } from "@/components/event-list";
import { MembershipButton } from "@/components/membership-button";
import { NotFoundMessage, parseId } from "@/components/not-found-message";
import { CardSection } from "@/components/ui/card";
import { EmptyState, Notice } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { useNow } from "@/lib/hooks";
import { isVisibleToParticipants } from "@/lib/permissions";
import { sortByStartTime } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { MemberList } from "./member-list";

export function OrganizationDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useAppState();
  const now = useNow();

  const organizationId = parseId(id);
  const organization = state.organizations.find((item) => item.id === organizationId);
  if (!organization) {
    return <NotFoundMessage title="Organization not found" backHref="/organizations" backLabel="All organizations" />;
  }

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
            <EventList events={upcomingEvents} empty={<EmptyState icon={CalendarDays} title="No upcoming events" />} />
          </section>
        </div>
        <MemberList organizationId={organization.id} />
      </div>
    </div>
  );
}
