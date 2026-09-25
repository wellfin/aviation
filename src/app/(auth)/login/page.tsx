import type { Metadata } from "next";
import { AuthSwitch } from "@/components/auth/AuthBits";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { LoginDemoHint } from "@/components/auth/DemoHints";
import { LoginForm } from "@/components/auth/LoginForm";
import { firstParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Global Aviation Services Directory account.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const notice = firstParam(sp.reset) === "1" ? "Your password has been updated. Sign in with your new password." : undefined;

  return (
    <>
      <AuthHeading title="Welcome back 👋" subtitle="Sign in to your aviation command centre" />
      <LoginForm next={firstParam(sp.next)} notice={notice} />
      <AuthSwitch prompt="Don't have an account?" href="/signup" cta="Create free account" />
      <LoginDemoHint />
    </>
  );
}
