"use client";

import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/ui/card";
import { CardTable, Table } from "@/components/ui/table";
import { setUserEnabled } from "@/lib/actions";
import { fullName } from "@/lib/format";
import { describeRole } from "@/lib/permissions";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";

const COLUMNS = [{ label: "Name" }, { label: "Faculty" }, { label: "Role" }, { label: "Actions", hidden: true }];

/** Enable or disable user accounts. */
export function UsersAdmin() {
  const state = useAppState();
  const users = [...state.users].sort((a, b) => a.lastName.localeCompare(b.lastName));

  return (
    <CardSection title="Users" description="Disabled users cannot sign in or register for events.">
      <CardTable>
        <Table columns={COLUMNS}>
          {users.map((user) => (
            <tr key={user.id} className={`transition-colors hover:bg-surface-muted ${user.enabled ? "" : "text-muted"}`}>
              <td className="px-5 py-3">
                <p className="font-medium">{fullName(user)}</p>
                <p className="text-xs text-muted">{user.email}</p>
              </td>
              <td className="px-5 py-3">{user.faculty}, year {user.studyYear}</td>
              <td className="px-5 py-3">{describeRole(state, user)}</td>
              <td className="px-5 py-3 text-right">
                <Button
                  size="sm"
                  variant={user.enabled ? "ghost" : "secondary"}
                  onClick={() =>
                    runAction(
                      () => setUserEnabled(user.id, !user.enabled),
                      `${fullName(user)} was ${user.enabled ? "disabled" : "enabled"}.`,
                    )
                  }
                >
                  {user.enabled ? "Disable" : "Enable"}
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </CardTable>
    </CardSection>
  );
}
