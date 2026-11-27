import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-hivis">
      <div aria-hidden className="h-4 bg-hazard" />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Link href="/" aria-label="SayPay home">
          <Logo tone="amber" />
        </Link>
        <p className="mt-10 font-display text-[9rem] leading-none font-extrabold text-ink">404</p>
        <h1 className="mt-2 text-4xl leading-none font-extrabold uppercase">
          <span className="bg-ink box-decoration-clone px-2 text-hivis">Road closed</span>
        </h1>
        <p className="mt-5 max-w-sm font-medium text-ink/75">This page doesn&apos;t exist or has moved. Let&apos;s get you back on site.</p>
        <Link href="/" className={buttonClass("primary", "lg", "mt-9")}>
          Back to SayPay
        </Link>
      </div>
      <div aria-hidden className="h-4 bg-hazard" />
    </main>
  );
}
