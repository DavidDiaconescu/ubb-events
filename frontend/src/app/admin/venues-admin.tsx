"use client";

import { Plus } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { createVenue } from "@/lib/actions";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import { useFormState } from "@/lib/use-form-state";

/** The list of venues and a form to add one. */
export function VenuesAdmin() {
  const state = useAppState();

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
      <NewVenueForm />
    </div>
  );
}

function NewVenueForm() {
  const { values, setField, reset } = useFormState({ name: "", address: "", maxCapacity: "", online: false });

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const input = { ...values, maxCapacity: values.maxCapacity === "" ? null : Number(values.maxCapacity) };
    if (await runAction(() => createVenue(input), `The venue "${values.name.trim()}" was added.`)) {
      reset();
    }
  }

  return (
    <CardSection title="Add a venue" className="self-start">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" htmlFor="venue-name">
          <Input id="venue-name" maxLength={255} value={values.name} onChange={(e) => setField("name", e.target.value)} />
        </Field>
        <Checkbox label="Online venue" checked={values.online} onChange={(e) => setField("online", e.target.checked)} />
        <Field label={values.online ? "Address (optional)" : "Address"} htmlFor="venue-address">
          <Input id="venue-address" maxLength={255} value={values.address} onChange={(e) => setField("address", e.target.value)} />
        </Field>
        <Field label="Maximum capacity (optional)" htmlFor="venue-capacity">
          <Input
            id="venue-capacity"
            type="number"
            min={1}
            value={values.maxCapacity}
            onChange={(e) => setField("maxCapacity", e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={values.name.trim() === ""}>
          <Plus className="size-4" aria-hidden="true" />
          Add venue
        </Button>
      </form>
    </CardSection>
  );
}
