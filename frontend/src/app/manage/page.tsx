import type { Metadata } from "next";
import { ManagedEvents } from "./managed-events";

export const metadata: Metadata = { title: "Manage events" };

export default function ManagePage() {
  return <ManagedEvents />;
}
