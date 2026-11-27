import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { publicEnv } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });

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
  themeColor: "#0B0D10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${interTight.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
