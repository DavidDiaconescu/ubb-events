"use client";

import { useRouter } from "next/navigation";
import { Notice } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { fullName, initials } from "@/lib/format";
import { signIn } from "@/lib/mock-api";
import { describeRole } from "@/lib/permissions";
import { useAppState } from "@/lib/store";
import { runAction } from "@/lib/toast";

/** The accounts highlighted on the sign-in page, one for each actor of the system. */
const DEMO_ACCOUNTS = [
  { userId: 4, scenario: "Browse events, register, join a waitlist, cancel, give feedback." },
  { userId: 5, scenario: "A first-year student who is not a member of any organization yet." },
  { userId: 2, scenario: "Create events, manage registrations, check-in, tasks and announcements." },
  { userId: 6, scenario: "Coordinator of another organization, with an approved event to publish." },
  { userId: 1, scenario: "Approve or reject events, manage organizations, users and venues." },
];

/**
 * Mock sign-in: choose one of the demo accounts.
 * Real authentication will replace this page once the frontend is connected to the backend.
 */
export function DemoAccountPicker() {
  const router = useRouter();
  const state = useAppState();

  function handleSignIn(userId: number) {
    if (runAction(() => signIn(userId))) {
      router.push("/");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Sign in" description="Choose a demo account to explore the app from a different role." />

      <div className="mb-6">
        <Notice title="No password needed">
          Authentication is not implemented yet. Every account below represents one of the actors of the system.
        </Notice>
      </div>

      <ul className="space-y-3">
        {DEMO_ACCOUNTS.map(({ userId, scenario }) => {
          const user = state.users.find((item) => item.id === userId);
          if (!user) return null;
          const isCurrent = state.currentUserId === userId;

          return (
            <li key={userId}>
              <button
                type="button"
                onClick={() => handleSignIn(userId)}
                className={`flex w-full items-center gap-4 rounded-xl border bg-surface p-4 text-left transition-colors hover:border-primary ${
                  isCurrent ? "border-primary" : "border-border"
                }`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-primary">
                  {initials(user)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className="font-medium">{fullName(user)}</span>
                    <span className="text-sm text-primary">{describeRole(state, user)}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{scenario}</span>
                </span>
                {isCurrent && <span className="text-xs font-medium text-primary">Signed in</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
