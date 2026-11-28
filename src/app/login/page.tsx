import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/icons";
import { freeQuoteLimit, isBillingConfigured } from "@/lib/env";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const mode = sp.mode === "signup" ? "signup" : "signin";
  const next = typeof sp.next === "string" ? sp.next : "/dashboard";
  const linkError = sp.error === "link";

  return (
    <main className="flex min-h-dvh flex-col items-center bg-canvas px-4 py-10 sm:py-16">
      <Link href="/" aria-label="SayPay home">
        <Logo />
      </Link>
      <div className="mt-8 w-full max-w-md rounded-2xl bg-surface p-6 shadow-lift ring-1 ring-line ring-inset sm:p-8">
        <h1 className="text-center text-2xl font-bold sm:text-3xl">{mode === "signup" ? "Create your account" : "Log in to SayPay"}</h1>
        <p className="mt-2 text-center text-ink-soft">
          {mode === "signup" ? `${isBillingConfigured() ? `Free for your first ${freeQuoteLimit()} quotes.` : "Free while we launch."} No card needed.` : "Welcome back."}
        </p>
        {linkError && (
          <p className="mt-5 rounded-xl bg-stop-soft p-3.5 text-sm font-medium text-stop" role="alert">
            That sign-in link has expired or was already used. Request a new one below.
          </p>
        )}
        <LoginForms initialMode={mode} next={next} />
      </div>
      <p className="mt-6 max-w-md text-center text-xs leading-relaxed text-muted">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline hover:text-ink">Terms</Link> and{" "}
        <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
        <br />
        Secured by Supabase · Payments by Stripe
      </p>
    </main>
  );
}
