"use client";

import { ListTodo, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { formatCalendarDate } from "@/lib/format";
import { TASK_STATUS_LABELS } from "@/lib/labels";
import { createTask, deleteTask, updateTaskStatus } from "@/lib/mock-api";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { Task, TaskStatus, UbbEvent } from "@/lib/types";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TasksTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const tasks = state.tasks
    .filter((task) => task.eventId === event.id)
    .sort(compareTasks);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <CardSection title="Tasks" description="Responsibilities of the organizing team." className="lg:col-span-2">
        {tasks.length === 0 ? (
          <EmptyState icon={ListTodo} title="No tasks yet" description="Split the preparation work between the organizers." />
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
          </ul>
        )}
      </CardSection>
      <NewTaskForm event={event} />
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const state = useAppState();
  const isDone = task.status === "DONE";

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${isDone ? "text-muted line-through" : ""}`}>{task.title}</p>
        {task.description && <p className="mt-0.5 text-sm text-muted">{task.description}</p>}
        <p className="mt-1 text-xs text-muted">
          {userDisplayName(state, task.assigneeId)}
          {task.dueDate && ` · due ${formatCalendarDate(task.dueDate)}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          aria-label={`Status of ${task.title}`}
          value={task.status}
          onChange={(changeEvent) => runAction(() => updateTaskStatus(task.id, changeEvent.target.value as TaskStatus))}
          className="h-8 w-36 py-1"
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>{TASK_STATUS_LABELS[status]}</option>
          ))}
        </Select>
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Delete ${task.title}`}
          onClick={() => runAction(() => deleteTask(task.id), "The task was deleted.")}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </li>
  );
}

function NewTaskForm({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const organizers = state.eventOrganizers.filter((organizer) => organizer.eventId === event.id);

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const input = { title, assigneeId: Number(assigneeId), dueDate, description };
    if (runAction(() => createTask(event.id, input), "The task was created and the assignee notified.")) {
      setTitle("");
      setDueDate("");
      setDescription("");
    }
  }

  return (
    <CardSection title="New task" className="self-start">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" htmlFor="task-title">
          <Input id="task-title" maxLength={255} value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} />
        </Field>
        <Field label="Assigned to" htmlFor="task-assignee" hint="Only organizers of this event can be assigned.">
          <Select id="task-assignee" value={assigneeId} onChange={(changeEvent) => setAssigneeId(changeEvent.target.value)}>
            <option value="">Choose an organizer</option>
            {organizers.map((organizer) => (
              <option key={organizer.id} value={organizer.userId}>{userDisplayName(state, organizer.userId)}</option>
            ))}
          </Select>
        </Field>
        <Field label="Due date (optional)" htmlFor="task-due-date">
          <Input id="task-due-date" type="date" value={dueDate} onChange={(changeEvent) => setDueDate(changeEvent.target.value)} />
        </Field>
        <Field label="Description (optional)" htmlFor="task-description">
          <Textarea
            id="task-description"
            maxLength={255}
            rows={3}
            value={description}
            onChange={(changeEvent) => setDescription(changeEvent.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={title.trim() === "" || assigneeId === ""}>
          <Plus className="size-4" aria-hidden="true" />
          Create task
        </Button>
      </form>
    </CardSection>
  );
}

/** Open tasks first, then by due date (tasks without a due date last). */
function compareTasks(a: Task, b: Task): number {
  const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  if (byStatus !== 0) return byStatus;
  return (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31");
}
