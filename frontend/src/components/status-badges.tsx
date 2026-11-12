import { Badge, type BadgeTone } from "@/components/ui/badge";
import {
  EVENT_CATEGORY_LABELS,
  EVENT_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/labels";
import type { EventCategory, EventStatus, RegistrationStatus, TaskStatus } from "@/lib/types";

const EVENT_STATUS_TONES: Record<EventStatus, BadgeTone> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "amber",
  APPROVED: "purple",
  PUBLISHED: "green",
  REGISTRATION_CLOSED: "blue",
  ONGOING: "purple",
  FINISHED: "neutral",
  ARCHIVED: "neutral",
  CANCELLED: "red",
};

const REGISTRATION_STATUS_TONES: Record<RegistrationStatus, BadgeTone> = {
  CONFIRMED: "green",
  WAITLISTED: "amber",
  CANCELLED: "neutral",
  CANCELLED_BY_ORGANIZER: "red",
  ATTENDED: "blue",
  ABSENT: "neutral",
};

const TASK_STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  TODO: "neutral",
  IN_PROGRESS: "amber",
  DONE: "green",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge tone={EVENT_STATUS_TONES[status]}>{EVENT_STATUS_LABELS[status]}</Badge>;
}

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return <Badge tone={REGISTRATION_STATUS_TONES[status]}>{REGISTRATION_STATUS_LABELS[status]}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={TASK_STATUS_TONES[status]}>{TASK_STATUS_LABELS[status]}</Badge>;
}

export function CategoryBadge({ category }: { category: EventCategory }) {
  return <Badge tone="blue">{EVENT_CATEGORY_LABELS[category]}</Badge>;
}
