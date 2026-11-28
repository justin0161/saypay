"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/icons";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Link href="/" aria-label="SayPay home">
        <Logo />
      </Link>
      <h1 className="mt-12 text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-lg text-ink-soft">Sorry about that. Nothing you entered has been lost — try again in a moment.</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Link href="/" className={buttonClass("secondary", "lg")}>
          Back to SayPay
        </Link>
      </div>
    </main>
  );
}
