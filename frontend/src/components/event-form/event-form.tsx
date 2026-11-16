"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import type { EventInput } from "@/lib/event-validation";
import type { Organization } from "@/lib/types";
import { GeneralSection, PlaceSection } from "./event-form-sections";
import { ScheduleSection } from "./schedule-section";
import { useEventForm } from "./use-event-form";

interface EventFormProps {
  organizations: Organization[];
  initialValues?: EventInput;
  /** The organization of an existing event cannot be changed. */
  lockOrganization?: boolean;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (input: EventInput) => void;
}

/** Create or edit an event; validated with the same rules as the backend before submitting. */
export function EventForm({ organizations, initialValues, lockOrganization = false, submitLabel, cancelHref, onSubmit }: EventFormProps) {
  const form = useEventForm(initialValues, organizations, onSubmit);

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-6">
      <GeneralSection form={form} organizations={organizations} lockOrganization={lockOrganization} />
      <PlaceSection form={form} />
      <ScheduleSection form={form} />
      <div className="flex justify-end gap-2">
        <ButtonLink href={cancelHref} variant="ghost">Cancel</ButtonLink>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
