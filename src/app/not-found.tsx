import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Link href="/" aria-label="SayPay home">
        <Logo />
      </Link>
      <p className="mt-12 font-display text-[8rem] leading-none font-bold tracking-[-0.06em] text-hivis">404</p>
      <h1 className="mt-2 text-4xl font-bold">We can&apos;t find that page</h1>
      <p className="mt-3 max-w-sm text-lg text-ink-soft">It may have moved, or the link might be wrong.</p>
      <Link href="/" className={buttonClass("primary", "lg", "mt-9")}>
        Back to SayPay
      </Link>
    </main>
  );
}
