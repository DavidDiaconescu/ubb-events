import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";

export function SignInRequired({ message = "Sign in to see this page." }: { message?: string }) {
  return (
    <EmptyState
      title="You are not signed in"
      description={message}
      action={<ButtonLink href="/login" size="sm">Sign in</ButtonLink>}
    />
  );
}

export function AccessDenied() {
  return (
    <EmptyState
      title="You do not have access to this page"
      description="Switch to a demo account with the right role to continue."
      action={<ButtonLink href="/login" variant="secondary" size="sm">Switch account</ButtonLink>}
    />
  );
}
