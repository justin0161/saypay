import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-surface px-6 text-center">
      <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      <Link href="/" className="relative" aria-label="SayPay home">
        <Logo />
      </Link>
      <p className="tabular relative mt-12 font-display text-sm font-medium tracking-[0.1em] text-muted">ERROR 404</p>
      <h1 className="relative mt-3 text-4xl font-semibold tracking-[-0.035em]">Page not found</h1>
      <p className="relative mt-3 max-w-sm text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className={buttonClass("primary", "lg", "relative mt-10")}>
        Back to SayPay
      </Link>
    </main>
  );
}
