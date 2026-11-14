"use client";

import { CalendarDays, Info, MapPin, type LucideIcon } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { validateEventInput, type EventInput, type EventInputErrors } from "@/lib/event-validation";
import { fromDateTimeInputValue, toDateTimeInputValue } from "@/lib/format";
import { EVENT_CATEGORY_LABELS } from "@/lib/labels";
import { useAppState } from "@/lib/store";
import type { EventCategory, Organization, Visibility } from "@/lib/types";

/** Form fields are kept as strings (the way inputs report them) and converted on submit. */
interface FormValues {
  organizationId: string;
  venueId: string;
  title: string;
  description: string;
  category: EventCategory;
  visibility: Visibility;
  capacity: string;
  startTime: string;
  endTime: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
}

interface EventFormProps {
  organizations: Organization[];
  initialValues?: EventInput;
  /** The organization of an existing event cannot be changed. */
  lockOrganization?: boolean;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (input: EventInput) => void;
}

export function EventForm({ organizations, initialValues, lockOrganization = false, submitLabel, cancelHref, onSubmit }: EventFormProps) {
  const state = useAppState();
  const [values, setValues] = useState<FormValues>(() => toFormValues(initialValues, organizations));
  const [errors, setErrors] = useState<EventInputErrors>({});

  const selectedVenue = state.venues.find((venue) => venue.id === Number(values.venueId)) ?? null;

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const input = toEventInput(values);
    const validationErrors = validateEventInput(input, selectedVenue);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(input);
    }
  }

  /** Props shared by every control: id, current value and accessible error wiring. */
  function controlProps(key: keyof FormValues) {
    const error = errors[key as keyof EventInputErrors];
    return {
      id: key,
      name: key,
      value: values[key],
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${key}-error` : undefined,
    };
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card className="space-y-5">
        <FormSectionTitle icon={Info}>General information</FormSectionTitle>
        <Field label="Organization" htmlFor="organizationId" error={errors.organizationId}>
          <Select
            {...controlProps("organizationId")}
            disabled={lockOrganization}
            onChange={(event) => updateValue("organizationId", event.target.value)}
          >
            <option value="">Choose an organization</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input {...controlProps("title")} maxLength={255} onChange={(event) => updateValue("title", event.target.value)} />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description} hint="What will participants do or learn? What should they bring?">
          <Textarea {...controlProps("description")} rows={5} onChange={(event) => updateValue("description", event.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category">
            <Select {...controlProps("category")} onChange={(event) => updateValue("category", event.target.value as EventCategory)}>
              {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Who can register" htmlFor="visibility">
            <Select {...controlProps("visibility")} onChange={(event) => updateValue("visibility", event.target.value as Visibility)}>
              <option value="PUBLIC">Everyone</option>
              <option value="MEMBERS_ONLY">Members of the organization only</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="space-y-5">
        <FormSectionTitle icon={MapPin}>Place and capacity</FormSectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Venue"
            htmlFor="venueId"
            hint={selectedVenue?.maxCapacity ? `Holds up to ${selectedVenue.maxCapacity} people.` : undefined}
          >
            <Select {...controlProps("venueId")} onChange={(event) => updateValue("venueId", event.target.value)}>
              <option value="">To be announced</option>
              {state.venues.map((venue) => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Capacity" htmlFor="capacity" error={errors.capacity} hint="Further registrations go to the waitlist.">
            <Input {...controlProps("capacity")} type="number" min={1} inputMode="numeric" onChange={(event) => updateValue("capacity", event.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-5">
        <FormSectionTitle icon={CalendarDays}>Schedule</FormSectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Starts" htmlFor="startTime" error={errors.startTime}>
            <Input {...controlProps("startTime")} type="datetime-local" onChange={(event) => updateValue("startTime", event.target.value)} />
          </Field>
          <Field label="Ends" htmlFor="endTime" error={errors.endTime}>
            <Input {...controlProps("endTime")} type="datetime-local" onChange={(event) => updateValue("endTime", event.target.value)} />
          </Field>
          <Field label="Registration opens" htmlFor="registrationOpensAt" error={errors.registrationOpensAt}>
            <Input {...controlProps("registrationOpensAt")} type="datetime-local" onChange={(event) => updateValue("registrationOpensAt", event.target.value)} />
          </Field>
          <Field
            label="Registration closes"
            htmlFor="registrationClosesAt"
            error={errors.registrationClosesAt}
            hint="Must be before the event starts."
          >
            <Input {...controlProps("registrationClosesAt")} type="datetime-local" onChange={(event) => updateValue("registrationClosesAt", event.target.value)} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <ButtonLink href={cancelHref} variant="ghost">Cancel</ButtonLink>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

function FormSectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold">
      <Icon className="size-5 text-primary" aria-hidden="true" />
      {children}
    </h2>
  );
}

function toFormValues(input: EventInput | undefined, organizations: Organization[]): FormValues {
  if (!input) {
    return {
      // Preselect the organization when the user can only create events for one.
      organizationId: organizations.length === 1 ? String(organizations[0].id) : "",
      venueId: "",
      title: "",
      description: "",
      category: "WORKSHOP",
      visibility: "PUBLIC",
      capacity: "30",
      startTime: "",
      endTime: "",
      registrationOpensAt: "",
      registrationClosesAt: "",
    };
  }
  return {
    organizationId: String(input.organizationId),
    venueId: input.venueId === null ? "" : String(input.venueId),
    title: input.title,
    description: input.description,
    category: input.category,
    visibility: input.visibility,
    capacity: String(input.capacity),
    startTime: toDateTimeInputValue(input.startTime),
    endTime: toDateTimeInputValue(input.endTime),
    registrationOpensAt: toDateTimeInputValue(input.registrationOpensAt),
    registrationClosesAt: toDateTimeInputValue(input.registrationClosesAt),
  };
}

function toEventInput(values: FormValues): EventInput {
  return {
    organizationId: Number(values.organizationId),
    venueId: values.venueId === "" ? null : Number(values.venueId),
    title: values.title,
    description: values.description,
    category: values.category,
    visibility: values.visibility,
    capacity: values.capacity === "" ? Number.NaN : Number(values.capacity),
    startTime: fromDateTimeInputValue(values.startTime),
    endTime: fromDateTimeInputValue(values.endTime),
    registrationOpensAt: fromDateTimeInputValue(values.registrationOpensAt),
    registrationClosesAt: fromDateTimeInputValue(values.registrationClosesAt),
  };
}
