import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { publicEnv } from "@/lib/env";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: "SayPay — Win more quotes with a voice note", template: "%s · SayPay" },
  description:
    "SayPay helps tradespeople and service businesses send quotes with a voice-note walkthrough and site photos, get approvals in one tap, and collect deposits faster.",
  applicationName: "SayPay",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "SayPay", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "SayPay — win more quotes with a voice note",
    description: "Send a quote with a 60-second voice note. Get it approved and the deposit paid — from your van.",
    url: "https://saypay.co",
    siteName: "SayPay",
    type: "website",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0F1B2D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${figtree.variable} ${bricolage.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
