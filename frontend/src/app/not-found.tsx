import { NotFoundMessage } from "@/components/not-found-message";

export default function NotFound() {
  return <NotFoundMessage title="Page not found" backHref="/" backLabel="Go to the home page" />;
}
