import type { Metadata } from "next";
import { MyRegistrations } from "./my-registrations";

export const metadata: Metadata = { title: "My events" };

export default function MyEventsPage() {
  return <MyRegistrations />;
}
