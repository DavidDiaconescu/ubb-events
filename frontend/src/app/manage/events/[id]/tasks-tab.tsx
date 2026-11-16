"use client";

import { ListTodo, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form";
import { deleteTask, updateTaskStatus } from "@/lib/actions";
import { formatCalendarDate } from "@/lib/format";
import { TASK_STATUS_LABELS } from "@/lib/labels";
import { userDisplayName } from "@/lib/queries";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { Task, TaskStatus, UbbEvent } from "@/lib/types";
import { NewTaskForm } from "./new-task-form";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TasksTab({ event }: { event: UbbEvent }) {
  const state = useAppState();
  const tasks = state.tasks.filter((task) => task.eventId === event.id).sort(compareTasks);

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
          {STATUS_ORDER.map((status) => <option key={status} value={status}>{TASK_STATUS_LABELS[status]}</option>)}
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

/** Open tasks first, then by due date (tasks without a due date last). */
function compareTasks(a: Task, b: Task): number {
  const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  if (byStatus !== 0) return byStatus;
  return (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31");
}
