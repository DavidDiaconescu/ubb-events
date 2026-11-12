import type { Metadata } from "next";
import { DemoAccountPicker } from "./demo-account-picker";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <DemoAccountPicker />;
}
