"use client";

import { Button } from "@/components/ui/button";
import { joinOrganization, leaveOrganization } from "@/lib/mock-api";
import { isActiveMember, isCoordinator } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";
import { runAction } from "@/lib/toast";
import type { Organization } from "@/lib/types";

/** Join / leave button for the current user. Coordinators cannot leave from here. */
export function MembershipButton({ organization }: { organization: Organization }) {
  const state = useAppState();
  const user = useCurrentUser();

  if (user === null || organization.status !== "ACTIVE") return null;
  if (isCoordinator(state, user.id, organization.id)) {
    return <span className="text-sm font-medium text-primary">You coordinate this organization</span>;
  }

  if (isActiveMember(state, user.id, organization.id)) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => runAction(() => leaveOrganization(organization.id), `You left ${organization.name}.`)}
      >
        Leave
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => runAction(() => joinOrganization(organization.id), `Welcome to ${organization.name}!`)}
    >
      Join
    </Button>
  );
}
