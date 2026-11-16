"use client";

import { useCurrentUser } from "@/lib/store";
import { SignedInDashboard } from "./_dashboard/signed-in-dashboard";
import { Welcome } from "./_dashboard/welcome";

/** Home page: a welcome page for visitors, a personal dashboard for signed-in users. */
export function HomeDashboard() {
  const user = useCurrentUser();
  return user ? <SignedInDashboard user={user} /> : <Welcome />;
}
