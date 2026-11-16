"use client";

import { Building2, MapPin, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { AccessDenied, SignInRequired } from "@/components/sign-in-required";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { isAdmin } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";
import { ApprovalQueue } from "./approval-queue";
import { OrganizationsAdmin } from "./organizations-admin";
import { UsersAdmin } from "./users-admin";
import { VenuesAdmin } from "./venues-admin";

type TabId = "approvals" | "organizations" | "users" | "venues";

export function AdminConsole() {
  const state = useAppState();
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabId>("approvals");

  if (user === null) return <SignInRequired />;
  if (!isAdmin(user)) return <AccessDenied />;

  const pendingEvents = state.events.filter((event) => event.status === "PENDING_APPROVAL");

  return (
    <div>
      <PageHeader title="Administration" description="Approve events and manage organizations, users and venues." />
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "approvals", label: "Approvals", count: pendingEvents.length, icon: ShieldCheck },
          { id: "organizations", label: "Organizations", count: state.organizations.length, icon: Building2 },
          { id: "users", label: "Users", count: state.users.length, icon: Users },
          { id: "venues", label: "Venues", count: state.venues.length, icon: MapPin },
        ]}
      />
      {activeTab === "approvals" && <ApprovalQueue events={pendingEvents} />}
      {activeTab === "organizations" && <OrganizationsAdmin />}
      {activeTab === "users" && <UsersAdmin />}
      {activeTab === "venues" && <VenuesAdmin />}
    </div>
  );
}
