import Link from "next/link";
import { Logo } from "@/components/ui/icons";
import { publicEnv } from "@/lib/env";

export function contactLine() {
  return publicEnv.contactEmail ? (
    <a href={`mailto:${publicEnv.contactEmail}`} className="font-semibold text-hivis hover:underline">
      {publicEnv.contactEmail}
    </a>
  ) : (
    "the contact details on our website"
  );
}

/** Shared layout for the Privacy and Terms pages. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <Link href="/login" className="text-[15px] font-semibold text-hivis hover:underline">
            Log in
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-muted">Last updated {updated}</p>
        <div className="legal mt-10 space-y-8 rounded-2xl bg-surface p-6 leading-relaxed text-ink-soft shadow-card ring-1 ring-line ring-inset sm:p-10 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1">
          {children}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link> · <Link href="/terms" className="hover:text-ink">Terms</Link> ·{" "}
          <Link href="/" className="hover:text-ink">Home</Link>
        </p>
      </main>
    </div>
  );
}
