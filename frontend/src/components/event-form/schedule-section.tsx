"use client";

import { CalendarDays } from "lucide-react";
import { Field, Input } from "@/components/ui/form";
import { FormSection } from "@/components/ui/form-section";
import type { EventFormControls } from "./use-event-form";

export function ScheduleSection({ form }: { form: EventFormControls }) {
  const { controlProps, errors } = form;
  return (
    <FormSection icon={CalendarDays} title="Schedule">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starts" htmlFor="startTime" error={errors.startTime}>
          <Input {...controlProps("startTime")} type="datetime-local" />
        </Field>
        <Field label="Ends" htmlFor="endTime" error={errors.endTime}>
          <Input {...controlProps("endTime")} type="datetime-local" />
        </Field>
        <Field label="Registration opens" htmlFor="registrationOpensAt" error={errors.registrationOpensAt}>
          <Input {...controlProps("registrationOpensAt")} type="datetime-local" />
        </Field>
        <Field label="Registration closes" htmlFor="registrationClosesAt" error={errors.registrationClosesAt} hint="Must be before the event starts.">
          <Input {...controlProps("registrationClosesAt")} type="datetime-local" />
        </Field>
      </div>
    </FormSection>
  );
}
