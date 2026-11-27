import Link from "next/link";
import { Logo } from "@/components/ui/icons";

export default function QuoteNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-8 text-2xl font-extrabold">This quote link isn&apos;t available</h1>
      <p className="mt-2 max-w-sm text-muted">
        It may have been withdrawn or the link was copied incompletely. Ask your contractor to resend it.
      </p>
      <Link href="/" className="mt-6 min-h-11 font-semibold text-ink underline">
        What is SayPay?
      </Link>
    </main>
  );
}
