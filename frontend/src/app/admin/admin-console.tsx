"use client";

import { Building2, CircleCheck, MapPin, Plus, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AccessDenied, SignInRequired } from "@/components/sign-in-required";
import { CategoryBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CARD_CLASSES, CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { formatEventTime, fullName } from "@/lib/format";
import { changeEventStatus, createVenue, setOrganizationStatus, setUserEnabled } from "@/lib/mock-api";
import { describeRole, isAdmin } from "@/lib/permissions";
import { organizationName, userDisplayName, venueLabel } from "@/lib/queries";
import { useAppState, useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { UbbEvent } from "@/lib/types";

type TabId = "approvals" | "organizations" | "users" | "venues";

export function AdminConsole() {
  const state = useAppState();
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabId>("approvals");

  if (user === null) return <SignInRequired />;
  if (!isAdmin(user)) return <AccessDenied />;

  const pendingEvents = state.events.filter((event) => event.status === "PENDING_APPROVAL");

  return (
    <div>
      <PageHeader title="Administration" description="Approve events and manage organizations, users and venues." />
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "approvals", label: "Approvals", count: pendingEvents.length, icon: ShieldCheck },
          { id: "organizations", label: "Organizations", count: state.organizations.length, icon: Building2 },
          { id: "users", label: "Users", count: state.users.length, icon: Users },
          { id: "venues", label: "Venues", count: state.venues.length, icon: MapPin },
        ]}
      />
      {activeTab === "approvals" && <ApprovalQueue events={pendingEvents} />}
      {activeTab === "organizations" && <OrganizationsAdmin />}
      {activeTab === "users" && <UsersAdmin />}
      {activeTab === "venues" && <VenuesAdmin />}
    </div>
  );
}

function ApprovalQueue({ events }: { events: UbbEvent[] }) {
  const state = useAppState();

  if (events.length === 0) {
    return <EmptyState icon={CircleCheck} title="No events are waiting for approval" />;
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className={`p-5 ${CARD_CLASSES}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/manage/events/${event.id}`} className="font-semibold hover:text-primary">{event.title}</Link>
                <CategoryBadge category={event.category} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {organizationName(state, event.organizationId)} · created by {userDisplayName(state, event.createdById)}
              </p>
              <p className="mt-1 text-sm">
                {formatEventTime(event.startTime, event.endTime)} · {venueLabel(state, event.venueId)} · {event.capacity} places
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-muted">{event.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => runAction(() => changeEventStatus(event.id, "APPROVED"), "The event was approved.")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => runAction(() => changeEventStatus(event.id, "DRAFT"), "The event was sent back to draft.")}
              >
                Reject
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrganizationsAdmin() {
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

function UsersAdmin() {
  const state = useAppState();
  const users = [...state.users].sort((a, b) => a.lastName.localeCompare(b.lastName));

  return (
    <CardSection title="Users" description="Disabled users cannot sign in or register for events.">
      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-y border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-5 py-2 font-medium">Name</th>
              <th scope="col" className="px-5 py-2 font-medium">Faculty</th>
              <th scope="col" className="px-5 py-2 font-medium">Role</th>
              <th scope="col" className="px-5 py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className={`transition-colors hover:bg-surface-muted ${user.enabled ? "" : "text-muted"}`}>
                <td className="px-5 py-3">
                  <p className="font-medium">{fullName(user)}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </td>
                <td className="px-5 py-3">{user.faculty}, year {user.studyYear}</td>
                <td className="px-5 py-3">{describeRole(state, user)}</td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="sm"
                    variant={user.enabled ? "ghost" : "secondary"}
                    onClick={() =>
                      runAction(
                        () => setUserEnabled(user.id, !user.enabled),
                        `${fullName(user)} was ${user.enabled ? "disabled" : "enabled"}.`,
                      )
                    }
                  >
                    {user.enabled ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardSection>
  );
}

function VenuesAdmin() {
  const state = useAppState();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [online, setOnline] = useState(false);

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const input = { name, address, online, maxCapacity: maxCapacity === "" ? null : Number(maxCapacity) };
    if (runAction(() => createVenue(input), `The venue "${name.trim()}" was added.`)) {
      setName("");
      setAddress("");
      setMaxCapacity("");
      setOnline(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <CardSection title="Venues" className="lg:col-span-2">
        <ul className="divide-y divide-border">
          {state.venues.map((venue) => (
            <li key={venue.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium">{venue.name}</p>
                <p className="text-muted">{venue.online ? "Online" : venue.address}</p>
              </div>
              <span className="text-muted">
                {venue.maxCapacity ? `Up to ${venue.maxCapacity} people` : "No capacity limit"}
              </span>
            </li>
          ))}
        </ul>
      </CardSection>

      <CardSection title="Add a venue" className="self-start">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" htmlFor="venue-name">
            <Input id="venue-name" maxLength={255} value={name} onChange={(changeEvent) => setName(changeEvent.target.value)} />
          </Field>
          <Checkbox label="Online venue" checked={online} onChange={(changeEvent) => setOnline(changeEvent.target.checked)} />
          <Field label={online ? "Address (optional)" : "Address"} htmlFor="venue-address">
            <Input id="venue-address" maxLength={255} value={address} onChange={(changeEvent) => setAddress(changeEvent.target.value)} />
          </Field>
          <Field label="Maximum capacity (optional)" htmlFor="venue-capacity">
            <Input
              id="venue-capacity"
              type="number"
              min={1}
              value={maxCapacity}
              onChange={(changeEvent) => setMaxCapacity(changeEvent.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={name.trim() === ""}>
            <Plus className="size-4" aria-hidden="true" />
            Add venue
          </Button>
        </form>
      </CardSection>
    </div>
  );
}
