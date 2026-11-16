"use client";

import { Field, Input } from "@/components/ui/form";
import type { AccountFormValues } from "./sign-in-form";

interface RegisterFieldsProps {
  values: AccountFormValues;
  setField: <K extends keyof AccountFormValues>(key: K, value: AccountFormValues[K]) => void;
}

/** The profile fields asked for only when creating an account. */
export function RegisterFields({ values, setField }: RegisterFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="First name" htmlFor="firstName">
        <Input id="firstName" required value={values.firstName} onChange={(e) => setField("firstName", e.target.value)} />
      </Field>
      <Field label="Last name" htmlFor="lastName">
        <Input id="lastName" required value={values.lastName} onChange={(e) => setField("lastName", e.target.value)} />
      </Field>
      <Field label="Faculty" htmlFor="faculty">
        <Input id="faculty" required value={values.faculty} onChange={(e) => setField("faculty", e.target.value)} />
      </Field>
      <Field label="Study year" htmlFor="studyYear">
        <Input id="studyYear" type="number" min={1} max={6} required value={values.studyYear}
          onChange={(e) => setField("studyYear", e.target.value)} />
      </Field>
    </div>
  );
}
