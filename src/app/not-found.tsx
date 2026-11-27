import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-[36rem] -translate-1/2 animate-blob rounded-full bg-sunset opacity-20 blur-3xl" />
      <Link href="/" className="relative" aria-label="SayPay home">
        <Logo />
      </Link>
      <p className="relative mt-8 font-display text-8xl font-extrabold tracking-tighter text-sunset">404</p>
      <h1 className="relative mt-2 text-3xl font-extrabold tracking-tight">This page has gone quiet</h1>
      <p className="relative mt-2 max-w-sm text-muted">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className={buttonClass("primary", "lg", "relative mt-8")}>
        Back to SayPay
      </Link>
    </main>
  );
}
