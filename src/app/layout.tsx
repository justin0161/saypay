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
    "Send quotes with a voice note. Clients accept in one tap and pay a deposit or in full, by card or bank transfer. Built for tradespeople.",
  applicationName: "SayPay",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "SayPay", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "SayPay — win more quotes with a voice note",
    description: "Send a quote with a voice note. Clients accept in one tap and pay a deposit — by card or bank transfer.",
    locale: "en_GB",
    url: "/",
    siteName: "SayPay",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
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
