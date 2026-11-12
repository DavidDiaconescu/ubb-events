import type { Metadata } from "next";
import { EventBrowser } from "./event-browser";

export const metadata: Metadata = { title: "Discover events" };

export default function EventsPage() {
  return <EventBrowser />;
}
