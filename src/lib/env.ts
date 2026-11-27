/**
 * Centralised, typed access to environment variables.
 * Public values are inlined by Next.js at build time; server values throw a
 * helpful error when missing instead of failing deep inside an SDK.
 */

export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}. See .env.example.`);
  }
  return value;
}

export const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "quote-media";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function freeQuoteLimit(): number {
  const n = Number(process.env.FREE_QUOTE_LIMIT ?? 5);
  return Number.isFinite(n) && n >= 0 ? n : 5;
}
