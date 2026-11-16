"use client";

import { Info, MapPin } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { FormSection } from "@/components/ui/form-section";
import { EVENT_CATEGORY_LABELS } from "@/lib/labels";
import type { Organization } from "@/lib/types";
import type { EventFormControls } from "./use-event-form";

export function GeneralSection({ form, organizations, lockOrganization }: {
  form: EventFormControls;
  organizations: Organization[];
  lockOrganization: boolean;
}) {
  const { controlProps, errors } = form;
  return (
    <FormSection icon={Info} title="General information">
      <Field label="Organization" htmlFor="organizationId" error={errors.organizationId}>
        <Select {...controlProps("organizationId")} disabled={lockOrganization}>
          <option value="">Choose an organization</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Title" htmlFor="title" error={errors.title}>
        <Input {...controlProps("title")} maxLength={255} />
      </Field>
      <Field label="Description" htmlFor="description" error={errors.description} hint="What will participants do or learn? What should they bring?">
        <Textarea {...controlProps("description")} rows={5} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="category">
          <Select {...controlProps("category")}>
            {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Who can register" htmlFor="visibility">
          <Select {...controlProps("visibility")}>
            <option value="PUBLIC">Everyone</option>
            <option value="MEMBERS_ONLY">Members of the organization only</option>
          </Select>
        </Field>
      </div>
    </FormSection>
  );
}

export function PlaceSection({ form }: { form: EventFormControls }) {
  const { controlProps, errors, venues, selectedVenue } = form;
  return (
    <FormSection icon={MapPin} title="Place and capacity">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Venue" htmlFor="venueId" hint={selectedVenue?.maxCapacity ? `Holds up to ${selectedVenue.maxCapacity} people.` : undefined}>
          <Select {...controlProps("venueId")}>
            <option value="">To be announced</option>
            {venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
          </Select>
        </Field>
        <Field label="Capacity" htmlFor="capacity" error={errors.capacity} hint="Further registrations go to the waitlist.">
          <Input {...controlProps("capacity")} type="number" min={1} inputMode="numeric" />
        </Field>
      </div>
    </FormSection>
  );
}
