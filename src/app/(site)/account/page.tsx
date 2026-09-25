import type { Metadata } from "next";
import { AccountDashboard } from "@/components/auth/AccountDashboard";

export const metadata: Metadata = {
  title: "My account",
  description: "Your Global Aviation Services Directory account — profile, saved providers and tools.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountDashboard />;
}
