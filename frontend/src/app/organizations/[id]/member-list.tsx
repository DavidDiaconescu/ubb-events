"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardSection } from "@/components/ui/card";
import { fullName } from "@/lib/format";
import { ORG_ROLE_LABELS } from "@/lib/labels";
import { useAppState } from "@/lib/store";

/** Active members of the organization: coordinators first, then alphabetically. */
export function MemberList({ organizationId }: { organizationId: number }) {
  const state = useAppState();

  const members = state.memberships
    .filter((membership) => membership.organizationId === organizationId && membership.active)
    .flatMap((membership) => {
      const user = state.users.find((item) => item.id === membership.userId);
      return user ? [{ membership, user }] : [];
    })
    .sort((a, b) =>
      a.membership.role === b.membership.role
        ? a.user.lastName.localeCompare(b.user.lastName)
        : a.membership.role === "COORDINATOR" ? -1 : 1);

  return (
    <CardSection title="Members" description={`${members.length} active`} className="self-start">
      <ul className="space-y-2.5">
        {members.map(({ membership, user }) => (
          <li key={membership.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <Avatar user={user} size="sm" />
              <span className="truncate">{fullName(user)}</span>
            </span>
            {membership.role === "COORDINATOR" && <Badge tone="blue">{ORG_ROLE_LABELS.COORDINATOR}</Badge>}
          </li>
        ))}
      </ul>
    </CardSection>
  );
}
