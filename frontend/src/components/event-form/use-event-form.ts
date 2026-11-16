import { useState, type FormEvent } from "react";
import { validateEventInput, type EventInput, type EventInputErrors } from "@/lib/event-validation";
import { fromDateTimeInputValue, toDateTimeInputValue } from "@/lib/format";
import { useAppState } from "@/lib/store";
import type { EventCategory, Organization, Visibility } from "@/lib/types";

/** Form fields are kept as strings (the way inputs report them) and converted on submit. */
export interface EventFormValues {
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

/** State, validation and accessible control props for the event form. */
export function useEventForm(initialValues: EventInput | undefined, organizations: Organization[], onSubmit: (input: EventInput) => void) {
  const state = useAppState();
  const [values, setValues] = useState<EventFormValues>(() => toFormValues(initialValues, organizations));
  const [errors, setErrors] = useState<EventInputErrors>({});
  const selectedVenue = state.venues.find((venue) => venue.id === Number(values.venueId)) ?? null;

  function updateValue<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const input = toEventInput(values);
    const validationErrors = validateEventInput(input, selectedVenue);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) onSubmit(input);
  }

  /** Props shared by every control: id, current value, change handler and error wiring. */
  function controlProps<K extends keyof EventFormValues>(key: K) {
    const error = errors[key as keyof EventInputErrors];
    return {
      id: key,
      name: key,
      value: values[key],
      onChange: (event: { target: { value: string } }) => updateValue(key, event.target.value as EventFormValues[K]),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${key}-error` : undefined,
    };
  }

  return { venues: state.venues, selectedVenue, errors, handleSubmit, controlProps };
}

export type EventFormControls = ReturnType<typeof useEventForm>;

function toFormValues(input: EventInput | undefined, organizations: Organization[]): EventFormValues {
  if (!input) {
    return {
      // Preselect the organization when the user can only create events for one.
      organizationId: organizations.length === 1 ? String(organizations[0].id) : "",
      venueId: "", title: "", description: "", category: "WORKSHOP", visibility: "PUBLIC", capacity: "30",
      startTime: "", endTime: "", registrationOpensAt: "", registrationClosesAt: "",
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

function toEventInput(values: EventFormValues): EventInput {
  return {
    ...values,
    organizationId: Number(values.organizationId),
    venueId: values.venueId === "" ? null : Number(values.venueId),
    capacity: values.capacity === "" ? Number.NaN : Number(values.capacity),
    startTime: fromDateTimeInputValue(values.startTime),
    endTime: fromDateTimeInputValue(values.endTime),
    registrationOpensAt: fromDateTimeInputValue(values.registrationOpensAt),
    registrationClosesAt: fromDateTimeInputValue(values.registrationClosesAt),
  };
}
