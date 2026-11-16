"use client";

import { CARD_CLASSES, INTERACTIVE_CARD_CLASSES } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";

/** Password of every account in the demo data (backend: db/demo/V2__demo_data.sql). */
const DEMO_PASSWORD = "Parola123";

/** The demo accounts highlighted on the sign-in page, one for each actor of the system. */
const DEMO_ACCOUNTS = [
  { email: "andrei.pop@stud.ubbcluj.ro", name: "Andrei Pop", role: "Student", scenario: "Browse events, register, join a waitlist, cancel, give feedback." },
  { email: "maria.campean@stud.ubbcluj.ro", name: "Maria Câmpean", role: "Student", scenario: "A first-year student who is not a member of any organization yet." },
  { email: "mihai.ionescu@stud.ubbcluj.ro", name: "Mihai Ionescu", role: "Coordinator · UBB Tech Society", scenario: "Create events, manage registrations, check-in, tasks and announcements." },
  { email: "elena.moldovan@stud.ubbcluj.ro", name: "Elena Moldovan", role: "Coordinator · UBB Debate Club", scenario: "Coordinator of another organization, with an approved event to publish." },
  { email: "ana.popescu@ubbcluj.ro", name: "Ana Popescu", role: "Administrator", scenario: "Approve or reject events, manage organizations, users and venues." },
];

interface DemoAccountsProps {
  disabled: boolean;
  onSelect: (email: string, password: string, name: string) => void;
}

/** One-click sign-in with the demo accounts of the local database. */
export function DemoAccounts({ disabled, onSelect }: DemoAccountsProps) {
  return (
    <section className="mt-8">
      <Notice title="Demo accounts">
        The local database contains demo data. Every demo account uses the password <strong>{DEMO_PASSWORD}</strong>.
      </Notice>
      <ul className="mt-4 space-y-3">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(account.email, DEMO_PASSWORD, account.name)}
              className={`block w-full p-4 text-left ${CARD_CLASSES} ${INTERACTIVE_CARD_CLASSES}`}
            >
              <span className="flex flex-wrap items-center gap-x-2">
                <span className="font-medium">{account.name}</span>
                <span className="text-sm text-primary">{account.role}</span>
              </span>
              <span className="mt-0.5 block text-sm text-muted">{account.email}</span>
              <span className="mt-0.5 block text-sm text-muted">{account.scenario}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
