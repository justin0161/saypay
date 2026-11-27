import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { publicEnv } from "@/lib/env";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow", display: "swap" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: "SayPay — Quotes approved by voice. Deposits paid today.", template: "%s · SayPay" },
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
    title: "SayPay — voice-backed quotes for trades",
    description: "Send a quote with a 60-second voice note. Get it approved and the deposit paid — from your van.",
    url: "https://saypay.co",
    siteName: "SayPay",
    type: "website",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#16181B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${barlow.variable} ${barlowCondensed.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
