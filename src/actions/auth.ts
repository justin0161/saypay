"use server";

import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, firstError, magicLinkSchema } from "@/lib/validation";

export type AuthState = { error?: string; message?: string } | undefined;

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  // Only allow same-origin relative paths.
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function signInWithPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email or password is incorrect." };
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    business_name: formData.get("business_name") || undefined,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=/dashboard`,
      data: { business_name: parsed.data.business_name ?? "" },
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { message: "Check your inbox to confirm your email, then you're in." };
  redirect("/dashboard?welcome=1");
}

export async function sendMagicLink(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createClient();
  const next = safeNext(formData.get("next"));
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.message };
  return { message: "Magic link sent — open it on this device to sign in." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Single entry point for the password form (keeps useActionState stable across tabs). */
export async function passwordAuth(state: AuthState, formData: FormData): Promise<AuthState> {
  return formData.get("mode") === "signup" ? signUp(state, formData) : signInWithPassword(state, formData);
}
