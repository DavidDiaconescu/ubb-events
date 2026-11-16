"use client";

import { Plus } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { createTask } from "@/lib/actions";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { UbbEvent } from "@/lib/types";
import { useFormState } from "@/lib/use-form-state";

/** Create a task for one of the event's organizers. */
export function NewTaskForm({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const { values, setField, reset } = useFormState({ title: "", assigneeId: "", dueDate: "", description: "" });
  const organizers = state.eventOrganizers.filter((organizer) => organizer.eventId === event.id);

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const input = { ...values, assigneeId: Number(values.assigneeId) };
    if (await runAction(() => createTask(event.id, input), "The task was created and the assignee notified.")) {
      reset(["title", "dueDate", "description"]);
    }
  }

  return (
    <CardSection title="New task" className="self-start">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" htmlFor="task-title">
          <Input id="task-title" maxLength={255} value={values.title} onChange={(e) => setField("title", e.target.value)} />
        </Field>
        <Field label="Assigned to" htmlFor="task-assignee" hint="Only organizers of this event can be assigned.">
          <Select id="task-assignee" value={values.assigneeId} onChange={(e) => setField("assigneeId", e.target.value)}>
            <option value="">Choose an organizer</option>
            {organizers.map((organizer) => (
              <option key={organizer.id} value={organizer.userId}>{userDisplayName(state, organizer.userId)}</option>
            ))}
          </Select>
        </Field>
        <Field label="Due date (optional)" htmlFor="task-due-date">
          <Input id="task-due-date" type="date" value={values.dueDate} onChange={(e) => setField("dueDate", e.target.value)} />
        </Field>
        <Field label="Description (optional)" htmlFor="task-description">
          <Textarea id="task-description" maxLength={255} rows={3} value={values.description}
            onChange={(e) => setField("description", e.target.value)} />
        </Field>
        <Button type="submit" className="w-full" disabled={values.title.trim() === "" || values.assigneeId === ""}>
          <Plus className="size-4" aria-hidden="true" />
          Create task
        </Button>
      </form>
    </CardSection>
  );
}
