"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { registerAccount, signIn } from "@/lib/actions";
import { runAction } from "@/lib/toast";
import { useFormState } from "@/lib/use-form-state";
import { DemoAccounts } from "./demo-accounts";
import { RegisterFields } from "./register-fields";

type Mode = "sign-in" | "register";

const INITIAL_VALUES = { email: "", password: "", firstName: "", lastName: "", faculty: "", studyYear: "1" };
export type AccountFormValues = typeof INITIAL_VALUES;

/** UC-01 / UC-02: sign in with an institutional account, or register a new one. */
export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { values, setField } = useFormState(INITIAL_VALUES);

  async function submit(action: () => Promise<void>, successMessage: string) {
    setIsSubmitting(true);
    const succeeded = await runAction(action, successMessage);
    setIsSubmitting(false);
    if (succeeded) router.push("/");
  }

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (mode === "sign-in") {
      void submit(() => signIn(values.email, values.password), "Welcome back!");
    } else {
      void submit(() => registerAccount({ ...values, studyYear: Number(values.studyYear) }), "Your account was created.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={mode === "sign-in" ? "Sign in" : "Create an account"}
        description={mode === "sign-in"
          ? "Use your university e-mail address and password."
          : "Only @stud.ubbcluj.ro and @ubbcluj.ro addresses can register."}
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && <RegisterFields values={values} setField={setField} />}
          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" autoComplete="email" required value={values.email} onChange={(e) => setField("email", e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password"
            hint={mode === "register" ? "8 to 72 characters, with at least one letter and one digit." : undefined}>
            <Input id="password" type="password" required value={values.password} onChange={(e) => setField("password", e.target.value)}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"} />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>{mode === "sign-in" ? "Sign in" : "Create account"}</Button>
            <button type="button" className="text-sm text-primary hover:underline" onClick={() => setMode(mode === "sign-in" ? "register" : "sign-in")}>
              {mode === "sign-in" ? "No account yet? Register" : "Already registered? Sign in"}
            </button>
          </div>
        </form>
      </Card>

      {mode === "sign-in" && (
        <DemoAccounts disabled={isSubmitting} onSelect={(email, password, name) => submit(() => signIn(email, password), `Signed in as ${name}.`)} />
      )}
    </div>
  );
}
