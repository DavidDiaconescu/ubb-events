"use client";

import { Building2, CalendarCheck, Compass, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasOrganizerAccess, isAdmin } from "@/lib/permissions";
import { useAppState, useCurrentUser } from "@/lib/store";

/** The header links; each one is shown only to the users it is relevant for. */
export function MainNavigation({ className }: { className: string }) {
  const pathname = usePathname();
  const state = useAppState();
  const user = useCurrentUser();

  const links = [
    { href: "/events", label: "Discover", icon: Compass, visible: true },
    { href: "/my-events", label: "My events", icon: CalendarCheck, visible: user !== null },
    { href: "/organizations", label: "Organizations", icon: Building2, visible: true },
    { href: "/manage", label: "Manage", icon: LayoutDashboard, visible: hasOrganizerAccess(state, user) },
    { href: "/admin", label: "Admin", icon: ShieldCheck, visible: isAdmin(user) },
  ].filter((link) => link.visible);

  return (
    <nav aria-label="Main" className={`items-stretch gap-1 overflow-x-auto ${className}`}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
              isActive ? "border-white text-white" : "border-transparent text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            <link.icon className="size-5" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
