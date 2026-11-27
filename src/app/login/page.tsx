import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/icons";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const mode = sp.mode === "signup" ? "signup" : "signin";
  const next = typeof sp.next === "string" ? sp.next : "/dashboard";
  const linkError = sp.error === "link";

  return (
    <main className="flex min-h-dvh flex-col px-4 py-6">
      <Link href="/" className="mx-auto" aria-label="SayPay home">
        <Logo />
      </Link>
      <div className="mx-auto mt-8 w-full max-w-sm flex-1 sm:mt-16">
        <h1 className="text-center text-3xl font-extrabold tracking-tight">
          {mode === "signup" ? "Start sending voice quotes" : "Welcome back"}
        </h1>
        <p className="mt-2 text-center text-muted">
          {mode === "signup" ? "Free for your first 5 quotes. No card needed." : "Log in to your SayPay dashboard."}
        </p>
        {linkError && (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
            That sign-in link has expired or was already used. Request a new one below.
          </p>
        )}
        <LoginForms initialMode={mode} next={next} />
      </div>
    </main>
  );
}
