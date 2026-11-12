import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { OrganizationDetails } from "./organization-details";

export const metadata: Metadata = { title: "Organization" };

export default function OrganizationPage({ params }: PageProps<"/organizations/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OrganizationDetails params={params} />
    </Suspense>
  );
}
