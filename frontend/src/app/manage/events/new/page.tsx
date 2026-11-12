import type { Metadata } from "next";
import { CreateEvent } from "./create-event";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
  return <CreateEvent />;
}
