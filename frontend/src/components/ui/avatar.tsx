import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

const SIZES = {
  sm: "size-7 text-[11px]",
  md: "size-8 text-xs",
  lg: "size-11 text-base",
};

/** The user's initials in a circle. */
export function Avatar({ user, size = "md", className = "bg-primary-soft text-primary" }: {
  user: Pick<User, "firstName" | "lastName">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${SIZES[size]} ${className}`} aria-hidden="true">
      {initials(user)}
    </span>
  );
}
