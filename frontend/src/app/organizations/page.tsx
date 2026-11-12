import type { Metadata } from "next";
import { OrganizationList } from "./organization-list";

export const metadata: Metadata = { title: "Organizations" };

export default function OrganizationsPage() {
  return <OrganizationList />;
}
