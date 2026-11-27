"use client";

import { useActionState, useState } from "react";
import { passwordAuth, sendMagicLink, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, Input } from "@/components/ui/field";

function Notice({ state }: { state: AuthState }) {
  if (!state) return null;
  if (state.error)
    return (
      <p className="rounded-xl bg-stop-soft p-3 text-sm font-medium text-stop ring-1 ring-stop/30 ring-inset" role="alert">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p className="rounded-xl bg-go-soft p-3 text-sm font-medium text-go-ink ring-1 ring-go/30 ring-inset" role="status">
        {state.message}
      </p>
    );
  return null;
}

export function LoginForms({ initialMode, next }: { initialMode: "signin" | "signup"; next: string }) {
  const [mode, setMode] = useState(initialMode);
  const [method, setMethod] = useState<"password" | "magic">("password");
  const [pwState, pwAction, pwPending] = useActionState(passwordAuth, undefined);
  const [mlState, mlAction, mlPending] = useActionState(sendMagicLink, undefined);

  return (
    <div className="mt-8 space-y-5">
      <div className="flex rounded-full bg-raised p-1">
        {(
          [
            ["signin", "Log in"],
            ["signup", "Create account"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={cn("min-h-10 flex-1 rounded-full text-sm font-semibold transition", mode === key ? "bg-surface text-ink shadow-card ring-1 ring-line ring-inset" : "text-muted hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>

      {method === "password" ? (
        <form action={pwAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="mode" value={mode} />
          {mode === "signup" && (
            <Field label="Business name" htmlFor="business_name">
              <Input id="business_name" name="business_name" autoComplete="organization" placeholder="Harper & Sons Plumbing" />
            </Field>
          )}
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
          </Field>
          <Field label="Password" htmlFor="password" hint={mode === "signup" ? "At least 8 characters" : undefined}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </Field>
          <Notice state={pwState} />
          <Button type="submit" variant="hivis" size="lg" className="w-full" disabled={pwPending}>
            {pwPending ? "One sec…" : mode === "signup" ? "Create my account" : "Log in"}
          </Button>
        </form>
      ) : (
        <form action={mlAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <Field label="Email" htmlFor="ml-email" hint="We'll email you a one-tap sign-in link.">
            <Input id="ml-email" name="email" type="email" autoComplete="email" inputMode="email" required />
          </Field>
          <Notice state={mlState} />
          <Button type="submit" variant="hivis" size="lg" className="w-full" disabled={mlPending}>
            {mlPending ? "Sending…" : "Email me a magic link"}
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs font-medium text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
      <Button variant="secondary" size="lg" className="w-full" onClick={() => setMethod(method === "password" ? "magic" : "password")}>
        {method === "password" ? "Use a magic link instead" : "Use email & password"}
      </Button>
    </div>
  );
}
