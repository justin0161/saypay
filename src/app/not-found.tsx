import Link from "next/link";
import { Logo } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-8 text-2xl font-extrabold">Page not found</h1>
      <Link href="/" className="mt-6 min-h-11 font-semibold text-ink underline">
        Back to SayPay
      </Link>
    </main>
  );
}
